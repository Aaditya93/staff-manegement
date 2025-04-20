"use server";

import User from "@/db/models/User";
import { auth } from "@/auth";
import mongoose from "mongoose";
import Conversation from "@/db/models/Conversation";

/**
 * Search for users by name or email
 */
export async function searchUsers(query: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    if (!query || query.trim().length < 2) {
      return { users: [] };
    }

    const searchRegex = new RegExp(query, "i");

    const users = await User.find({
      $and: [
        { _id: { $ne: session.user.id } },
        {
          $or: [{ name: searchRegex }, { email: searchRegex }],
        },
      ],
    })
      .select("_id name email image")
      .limit(10)
      .lean();
    return {
      users: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return { error: "Failed to search users" };
  }
}

/**
 * Create a new conversation with a user
 */
export async function createConversation(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const otherUserId = new mongoose.Types.ObjectId(userId);

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      isGroup: false,
      "members.memberId": { $all: [currentUserId, otherUserId] },
    });

    if (existingConversation) {
      return {
        conversationId: existingConversation._id.toString(),
        isNew: false,
      };
    }

    // Create new conversation
    const newConversation = new Conversation({
      isGroup: false,
      lastMessageId: null,
      members: [
        { memberId: currentUserId, lastSeenMessage: null },
        { memberId: otherUserId, lastSeenMessage: null },
      ],
    });

    await newConversation.save();

    return {
      conversationId: newConversation._id.toString(),
      isNew: true,
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return { error: "Failed to create conversation" };
  }
}
