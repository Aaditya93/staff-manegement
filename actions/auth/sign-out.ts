"use server";
import { auth, signOut } from "@/auth";
import dbConnect from "@/db/db";
import User from "@/db/models/User";

export const SignOut = async () => {
  await signOut({ redirectTo: "/home", redirect: true });
};

export const MutipleEmailSignIn = async (email: string) => {
  try {
    await dbConnect();

    // Get the current user from session
    const session = await auth();
    if (!session?.user?.email) {
      throw new Error("Not authenticated");
    }

    const currentUserEmail = session.user.email;

    // First, check if a user with this email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If user exists, we'll add their email to the current user's account
      // Find the current user first
      const currentUser = await User.findOne({ email: currentUserEmail });

      if (!currentUser) {
        throw new Error("Current user not found");
      }

      // Create an account entry with the email
      // Note: We're not assuming the existing user has accounts
      const accountToAdd: {
        email: string;
        accessToken?: string;
        refreshToken?: string;
        expiresAt?: Date;
        provider?: string;
        emailUpdatedAt?: Date;
      } = {
        email: email,
        emailUpdatedAt: new Date(),
      };

      // If the existing user has accounts with tokens, use those instead
      if (existingUser.accounts && existingUser.accounts.length > 0) {
        const existingAccount = existingUser.accounts[0];
        if (existingAccount) {
          accountToAdd.accessToken = existingAccount.accessToken;
          accountToAdd.refreshToken = existingAccount.refreshToken;
          accountToAdd.expiresAt = existingAccount.expiresAt;
          accountToAdd.provider = existingAccount.provider;
        }
      }

      // Update the current user
      const result = await User.findOneAndUpdate(
        { email: currentUserEmail },
        {
          $push: {
            accounts: accountToAdd,
          },
        },
        { new: true }
      );

      // Optionally delete the other user
      await User.deleteOne({ email });

      console.log("User updated successfully:", result);
    }
  } catch (error) {
    console.error("Error while adding email:", error);
    throw error; // Rethrow so UI can handle it
  }
};
