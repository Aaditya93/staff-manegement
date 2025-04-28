"use server";
import User from "@/db/models/User";
import { fetchUserEmailById } from "../mail/fetch-emails";
import { getValidAccessTokenForUser } from "../auth/token";
import dbConnect from "@/db/db";

export const getEmail = async (
  email: string,
  emailId: string,
  userId: string
) => {
  try {
    if (!userId) {
      console.error("userId is undefined or null");
      throw new Error("userId is required");
    }

    await dbConnect();
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Find account by email address, not by emailId
    const accountIndex = user.accounts.findIndex(
      (account: any) => account.email === email
    );

    if (accountIndex === -1) {
      throw new Error(`No account found with email: ${email}`);
    }

    const accessToken = await getValidAccessTokenForUser(user, accountIndex);
    const emailData = await fetchUserEmailById(emailId, accessToken);

    return emailData;
  } catch (error) {
    console.error("Error getting email:", error);
    throw new Error(`Failed to get email: ${error}`);
  }
};
