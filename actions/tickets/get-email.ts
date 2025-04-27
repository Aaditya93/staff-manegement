"use server";
import User from "@/db/models/User";
import { fetchUserEmailById } from "../mail/fetch-emails";
import { getValidAccessTokenForUser } from "../auth/token";
import dbConnect from "@/db/db";
export const getEmail = async (emailId: string, userId: string) => {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = await getValidAccessTokenForUser(user, 0);
    const email = await fetchUserEmailById(emailId, accessToken);
    console.log("Fetched email:", email);
    return email;
  } catch (error) {
    console.error("Error getting email:", error);
    throw new Error("Failed to get email: " + error);
  }
};
