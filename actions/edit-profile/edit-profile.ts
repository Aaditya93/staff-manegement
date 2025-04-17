"use server";

import { auth } from "@/auth";
import dbConnect from "@/db/db";
import User from "@/db/models/User";
import { revalidatePath } from "next/cache";

export const updateProfile = async (country?: string, name?: string) => {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("Not authenticated");
    }

    await dbConnect();

    const updateData: { country?: string; name?: string } = {};
    if (country !== undefined) updateData.country = country;
    if (name !== undefined) updateData.name = name;

    const response = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!response) {
      throw new Error("User not found");
    }

    // Revalidate the edit-profile path to reflect the changes
    revalidatePath("/edit-profile");

    return {
      success: true,
      message: "Profile updated successfully",
      user: {
        name: response.name,
        country: response.country,
      },
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
};
