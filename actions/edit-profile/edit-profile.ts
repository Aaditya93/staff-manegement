"use server";

import User from "@/db/models/User";
import dbConnect from "@/db/db";
import { revalidatePath } from "next/cache";

export async function updateUserName(userId: string, name: string) {
  try {
    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user name:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserCountry(userId: string, country: string) {
  try {
    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { country },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user country:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserProfileImage(userId: string, imageUrl: string) {
  try {
    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating profile image:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserBackgroundImage(
  userId: string,
  imageUrl: string
) {
  try {
    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { backgroundImage: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    revalidatePath("/profile");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating background image:", error);
    return { success: false, error: error.message };
  }
}

export const getUserById = async (userId: string) => {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
