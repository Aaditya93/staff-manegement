"use server";

import Conversation from "@/db/models/Conversation";
import Message from "@/db/models/Message";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { serializeData } from "@/utils/serialize";
import dbConnect from "@/db/db";

/**
 * Fetch conversations for the current user
 */
export async function fetchUserConversations() {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Find conversations where the user is a member
    const conversations = await Conversation.aggregate([
      {
        $match: {
          "members.memberId": userId,
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "lastMessageId",
          foreignField: "_id",
          as: "lastMessage",
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            members: "$members",
            currentUser: userId,
            isGroup: "$isGroup",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: [
                        "$_id",
                        {
                          $map: {
                            input: "$$members",
                            as: "m",
                            in: "$$m.memberId",
                          },
                        },
                      ],
                    },
                    { $ne: ["$_id", "$$currentUser"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                image: 1,
                email: 1,
                office: 1,
                phoneNumber: 1,
              },
            },
          ],
          as: "participants",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          isGroup: 1,
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
          participants: 1,
          updatedAt: 1,
          unreadCount: {
            $size: {
              $filter: {
                input: "$members",
                as: "member",
                cond: {
                  $and: [
                    { $eq: ["$$member.memberId", userId] },
                    {
                      $or: [
                        { $eq: ["$$member.lastSeenMessage", null] },
                        { $lt: ["$$member.lastSeenMessage", "$lastMessageId"] },
                      ],
                    },
                  ],
                },
              },
            },
          },
        },
      },
      { $sort: { updatedAt: -1 } },
    ]);
    const cleanConversations = serializeData(conversations);

    return { cleanConversations };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return { error: "Failed to fetch conversations" };
  }
}
/**
 * Send a new message
 */
export async function sendMessage(conversationId: string, content: string) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const convId = new mongoose.Types.ObjectId(conversationId);

    // Check if user belongs to this conversation
    const conversation = await Conversation.findOne({
      _id: convId,
      "members.memberId": userId,
    });

    if (!conversation) {
      return { error: "Conversation not found or access denied" };
    }

    // Create new message
    const newMessage = new Message({
      senderId: userId,
      conversationId: convId,
      type: "text",
      content: [content],
    });

    await newMessage.save();

    // Update conversation with last message
    await Conversation.updateOne(
      { _id: convId },
      {
        $set: {
          lastMessageId: newMessage._id,
          updatedAt: new Date(),
        },
      }
    );

    // Populate sender info for the response
    const populatedMessage = await Message.findById(newMessage._id).lean();

    // Check if populatedMessage is null
    if (!populatedMessage) {
      return { error: "Failed to retrieve the created message" };
    }

    const cleanMessage = serializeData(populatedMessage);

    return { success: true, message: cleanMessage };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}

export async function fetchConversationMessages(
  conversationId: string,
  limit: number = 50
) {
  await dbConnect();
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const currentUserId = session.user.id;
    const userId = new mongoose.Types.ObjectId(currentUserId);
    const convoId = new mongoose.Types.ObjectId(conversationId);

    // First check if the user belongs to the conversation
    const conversation = await Conversation.findOne({
      _id: convoId,
      "members.memberId": userId,
    });

    if (!conversation) {
      return { error: "Conversation not found or access denied" };
    }

    // Fetch messages for this conversation
    const messages = await Message.find({ conversationId: convoId })
      .sort({ createdAt: -1 }) // Latest messages first
      .limit(limit)
      .populate({
        path: "senderId",
        model: "User",
        select: "name email image",
      })
      .lean();

    // Find the latest message in the conversation (if any)
    if (messages.length > 0) {
      // Get the most recent message ID
      const latestMessageId = messages[0]._id;

      // Mark conversation as read by updating lastSeenMessage for current user
      await Conversation.updateOne(
        {
          _id: convoId,
          "members.memberId": userId,
        },
        {
          $set: {
            "members.$.lastSeenMessage": latestMessageId,
          },
        }
      );

      console.log(
        `Marked conversation ${conversationId} as read for user ${currentUserId}`
      );
    }

    // Create a clean, serializable structure to avoid circular references
    const cleanMessages = messages.map((msg) => ({
      _id: msg._id.toString(),
      content: msg.content,
      senderId: msg.senderId._id.toString(),
      senderName: msg.senderId.name,
      senderImage: msg.senderId.image,
      senderEmail: msg.senderId.email,
      conversationId: msg.conversationId.toString(),
      type: msg.type,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    }));

    // Return in chronological order (oldest to newest)
    return {
      messages: cleanMessages.reverse(),
      isRead: true, // Indicate that messages are now marked as read
    };
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return { error: "Failed to fetch messages" };
  }
}
export async function fetchConversationById(conversationId: string) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const currentUserId = session.user.id;
    const convId = new mongoose.Types.ObjectId(conversationId);
    const userId = new mongoose.Types.ObjectId(currentUserId);

    // Find the conversation and populate member data
    const conversation = await Conversation.findOne({
      _id: convId,
      "members.memberId": userId,
    })
      .populate({
        path: "members.memberId",
        model: "User",
        select: "name email image",
      })
      .populate({
        path: "lastMessageId",
        model: "Message",
      })
      .lean();

    if (!conversation) {
      return { error: "Conversation not found" };
    }

    // Mark messages as read by updating lastSeenMessage for the current user
    if (conversation.lastMessageId) {
      await Conversation.updateOne(
        {
          _id: convId,
          "members.memberId": userId,
        },
        {
          $set: {
            "members.$.lastSeenMessage": conversation.lastMessageId._id,
          },
        }
      );

      console.log(
        `Marked conversation ${conversationId} as read for user ${currentUserId}`
      );
    }

    // Calculate actual unread count for this user
    const memberData = conversation.members.find(
      (member: any) => member.memberId._id.toString() === currentUserId
    );

    const lastSeenMessageId = memberData?.lastSeenMessage;

    // Count unread messages (messages created after the last seen message)
    let unreadCount = 0;
    if (
      conversation.lastMessageId &&
      (!lastSeenMessageId ||
        lastSeenMessageId.toString() !==
          conversation.lastMessageId._id.toString())
    ) {
      // If we need the actual count of unread messages, we can query for messages
      // that are newer than the lastSeenMessageId
      if (lastSeenMessageId) {
        unreadCount = await Message.countDocuments({
          conversationId: convId,
          _id: { $gt: lastSeenMessageId },
          senderId: { $ne: userId }, // Only count messages not sent by current user
        });
      } else {
        // If no messages have been seen yet, count all messages not sent by the user
        unreadCount = await Message.countDocuments({
          conversationId: convId,
          senderId: { $ne: userId },
        });
      }
    }

    // Get the last message (if exists)
    const lastMessage = conversation.lastMessageId
      ? {
          _id: conversation.lastMessageId._id.toString(),
          content: conversation.lastMessageId.content,
          type: conversation.lastMessageId.type,
          createdAt: conversation.lastMessageId.createdAt.toISOString(),
        }
      : undefined;

    // Get participants (excluding current user)
    const participants = conversation.members
      .filter((member: any) => member.memberId._id.toString() !== currentUserId)
      .map((member: any) => ({
        _id: member.memberId._id.toString(),
        name: member.memberId.name,
        email: member.memberId.email,
        image: member.memberId.image,
      }));

    // Transform conversation for client-side use
    return {
      conversation: {
        _id: conversation._id.toString(),
        name: conversation.name,
        isGroup: conversation.isGroup,
        lastMessage,
        participants,
        updatedAt: conversation.updatedAt.toISOString(),
        unreadCount, // Now using the calculated unread count
        isRead: unreadCount === 0, // Add a convenience flag
      },
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return { error: "Failed to fetch conversation" };
  }
}
