"use server";

import Conversation from "@/db/models/Conversation";
import Message from "@/db/models/Message";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { serializeData } from "@/utils/serialize";

/**
 * Fetch conversations for the current user
 */
export async function fetchUserConversations() {
  try {
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

    return { conversations };
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
    console.log("Message sent successfully:", cleanMessage);
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
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Convert string ID to MongoDB ObjectId
    const convoId = new mongoose.Types.ObjectId(conversationId);

    const messages = await Message.find({ conversationId: convoId })
      .sort({ createdAt: -1 }) // Latest messages first
      .limit(limit)
      .populate({
        path: "senderId",
        select: "name email image", // Only get necessary user info
      })
      .lean();

    // Create a clean, serializable structure to avoid circular references
    const cleanMessages = messages.map((msg) => ({
      _id: msg._id.toString(),
      content: msg.content,
      senderId: {
        _id: msg.senderId._id.toString(),
        name: msg.senderId.name,
        email: msg.senderId.email,
        image: msg.senderId.image,
      },
      conversationId: msg.conversationId.toString(),
      type: msg.type,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    }));

    // Return in chronological order (oldest to newest)
    return {
      messages: cleanMessages.reverse(),
    };
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    return { error: "Failed to fetch messages" };
  }
}

export async function fetchConversationById(conversationId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const currentUserId = session.user.id;

    // Find the conversation and populate member data
    const conversation = await Conversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      "members.memberId": new mongoose.Types.ObjectId(currentUserId),
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
        unreadCount: 0, // You can implement unread count logic here
      },
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return { error: "Failed to fetch conversation" };
  }
}
