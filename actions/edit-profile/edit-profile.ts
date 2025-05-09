// Example: actions/edit-profile/edit-profile.ts
"use server";

import { auth } from "@/auth"; // Assuming you use auth
import User from "@/db/models/User";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  countries?: string[], // Changed to array of countries
  name?: string,
  accountType?: string,
  office?: string,
  position?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: name,
        office: office,
        position: position,
        destination: countries, // Now storing array of destinations
        role: accountType, // Save the account type
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return { success: false, message: "User not found" };
    }

    revalidatePath("/profile"); // Or the relevant path

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Database error occurred" };
  }
}
