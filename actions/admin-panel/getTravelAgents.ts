"use server";
import dbConnect from "@/db/db";
import TravelAgentUser from "@/db/models/travelAgentUser";
import { sendVarificationEmail } from "@/lib/mail";
import User from "@/db/models/User";
import generateToken from "@/lib/token";
import { revalidatePath } from "next/cache";

export const getTravelAgents = async () => {
  try {
    await dbConnect();
    const agents = await TravelAgentUser.find({
      accountApproved: false,
    })
      .sort({ createdAt: -1 })
      .lean(); // Added .lean() for better performance
    return agents;
  } catch (error) {
    console.error("Error fetching travel agents:", error);
    return null;
  }
};

export const regjectTravelAgent = async (id: string, email: string) => {
  try {
    await dbConnect();

    // Check if travel agent exists first
    const travelAgentUser = await TravelAgentUser.findById(id);
    if (!travelAgentUser) {
      return { error: "Travel agent user not found" };
    }

    // Then delete the user record
    const deletedUser = await User.findOneAndDelete({ email: email });
    if (!deletedUser) {
      console.error(`No user found with email: ${email}`);
      // Continue with deletion of travel agent even if user is not found
    }

    await travelAgentUser.deleteOne();
    revalidatePath("/admin-panel");
    return { success: "Travel agent rejected successfully" };
  } catch (error) {
    console.error("Error during rejecting travel agent user:", error);
    return { error: "Internal server error" };
  }
};

export const approveTravelAgent = async (id: string, email: string) => {
  try {
    await dbConnect();

    await TravelAgentUser.findByIdAndUpdate(id, {
      accountApproved: true,
    });
    const existingUser = await User.findOne({ email });
    const verificationToken = await generateToken(existingUser.email);
    await sendVarificationEmail(existingUser.email, verificationToken.token);
    return { success: "Travel agent approved successfully" };
  } catch (error) {
    console.error("Error during approving travel agent user:", error);
    return { error: "Internal server error" };
  }
};
