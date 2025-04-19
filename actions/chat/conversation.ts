"use server";

import { revalidatePath } from "next/cache";
import Conversation from "@/db/models/Conversation";
import Message from "@/db/models/Message";
import mongoose from "mongoose";
import { auth } from "@/auth";

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
 * Fetch messages for a specific conversation
 */
export async function fetchConversationMessages(conversationId: string) {
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

    // Fetch messages
    const messages = await Message.find({
      conversationId: convId,
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name image")
      .lean();

    // Update last seen message
    await Conversation.updateOne(
      {
        _id: convId,
        "members.memberId": userId,
      },
      {
        $set: {
          "members.$.lastSeenMessage": conversation.lastMessageId,
        },
      }
    );

    return { messages };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { error: "Failed to fetch messages" };
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

    revalidatePath(`/conversations/${conversationId}`);

    return { success: true, message: newMessage };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Failed to send message" };
  }
}
