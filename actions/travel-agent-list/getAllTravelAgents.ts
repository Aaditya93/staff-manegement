"use server";

import dbConnect from "@/db/db";
import TravelAgentUser from "@/db/models/travelAgentUser";
import User from "@/db/models/User";
import { serializeData } from "@/utils/serialize";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export const getAllTravelAgents = async () => {
  try {
    await dbConnect();
    const travelAgents = await User.find({
      role: "TravelAgent",
    })
      .lean()
      .select({
        _id: 1,
        name: 1,
        email: 1,
      });

    return travelAgents;
  } catch (error) {
    console.error("Error fetching travel agents:", error);
    return [];
  }
};

export async function deleteAgent(agentId: string) {
  try {
    await dbConnect();

    await User.findByIdAndDelete(agentId);

    // Revalidate related paths to update UI
    revalidatePath("/agent-list");

    return {
      success: true,
      message: "Agent deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting travel agent:", error);
    return {
      success: false,
      message: error || "Failed to delete agent",
    };
  }
}

export const getTravelAgentById = async (id: string) => {
  try {
    await dbConnect();
    const travelAgent = await User.findById(id)
      .populate("travelAgentId")
      .lean();

    const serializedTravelAgent = serializeData(travelAgent);
    return serializedTravelAgent;
  } catch (error) {
    console.error("Error fetching travel agent:", error);
    return null;
  }
};

const travelAgentFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().min(5, { message: "Phone number is required." }),
  company: z.string().min(1, { message: "Company name is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  address: z.string().min(5, { message: "Address is required." }),
});

type FormData = z.infer<typeof travelAgentFormSchema>;

export async function updateTravelAgentInfo(id: string, formData: FormData) {
  try {
    // Validate form data
    const validatedData = travelAgentFormSchema.parse(formData);

    // Connect to database
    await dbConnect();
    console.log(id, "userId");

    const user = await User.findById(id);
    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    let travelAgent;

    // Check if user already has a linked travel agent
    if (user.travelAgentId) {
      // Update existing travel agent
      travelAgent = await TravelAgentUser.findByIdAndUpdate(
        user.travelAgentId,
        {
          name: validatedData.name,
          email: validatedData.email,
          phoneNumber: validatedData.phoneNumber,
          company: validatedData.company,
          country: validatedData.country,
          address: validatedData.address,
        },
        { new: true }
      );
      console.log("Updated travel agent:", travelAgent);
    } else {
      // Create new travel agent
      travelAgent = new TravelAgentUser({
        name: validatedData.name,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        company: validatedData.company,
        country: validatedData.country,
        address: validatedData.address,
      });

      await travelAgent.save();
      console.log("Created new travel agent:", travelAgent);

      // Update user with new travel agent ID
      user.travelAgentId = travelAgent._id;
      await user.save();
    }

    // Revalidate the path to refresh data
    revalidatePath("/agent");

    return {
      success: true,
      message: "Travel agent information updated successfully.",
    };
  } catch (error) {
    console.error("Error updating travel agent info:", error);

    return {
      success: false,
      message: "Failed to update travel agent information.",
    };
  }
}
