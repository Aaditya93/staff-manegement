"use server";
import { auth } from "@/auth";
import dbConnect from "@/db/db";
import Conversation from "@/db/models/Conversation";
import User from "@/db/models/User";
import { serializeData } from "@/utils/serialize";
import { createConversation } from "../chat/search";

export const getAllEmployees = async () => {
  try {
    await dbConnect();
    const Employees = await User.find({
      role: ["SalesStaff", "ReservationStaff", "Admin"],
    }).lean();
    const serailizedEmployees = await serializeData(Employees);
    return serailizedEmployees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error("Failed to fetch employees");
  }
};

export const getConversationById = async (id: string) => {
  try {
    await dbConnect();
    const session = await auth();
    const conversation = await Conversation.findOne({
      isGroup: false,
      members: {
        $all: [
          { $elemMatch: { memberId: session?.user._id } },
          { $elemMatch: { memberId: id } },
        ],
      },
    }).lean();

    if (!conversation) {
      // Create a new conversation if not found
      const result = await createConversation(id);
      if (result.error) {
        throw new Error(result.error);
      }

      // Fetch the newly created conversation
      return result.conversationId;
    }

    console.log("Serialized Conversation", conversation);
    return conversation._id.toString();
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw new Error("Failed to fetch conversation");
  }
};
