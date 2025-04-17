"use server";

import { auth } from "@/auth";
import dbConnect from "@/db/db";
import User from "@/db/models/User";

export const updateProfileImage = async (url: string) => {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("Not authenticated");
    }

    await dbConnect();
    const response = await User.findByIdAndUpdate(
      session.user.id,
      { image: url },
      { new: true }
    );

    if (!response) {
      throw new Error("User not found");
    }

    return { success: true, message: "Profile image updated successfully" };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return { success: false, message: "Failed to update profile image" };
  }
};

export const updateBackgroundImage = async (url: string) => {
  try {
    const session = await auth();

    if (!session?.user.id) {
      throw new Error("Not authenticated");
    }

    await dbConnect();
    const response = await User.findByIdAndUpdate(
      session.user.id,
      { backgroundImage: url },
      { new: true }
    );

    if (!response) {
      throw new Error("User not found");
    }

    return { success: true, message: "Background image updated successfully" };
  } catch (error) {
    console.error("Error updating background image:", error);
    return { success: false, message: "Failed to update background image" };
  }
};
