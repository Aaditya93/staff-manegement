import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import client from "./lib/mongo";
import User, { emailVerified } from "./db/models/User";
import dbConnect from "./db/db";
import { User as NextAuthUser } from "next-auth";

// Extend the User type to include role property
declare module "next-auth" {
  interface User {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    provider?: string;
  }

  interface Session {
    user: User;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async linkAccount({ user }) {
      if (user.id) {
        await emailVerified(user.id);
      }
    },

    // This event fires when a user is created
    async createUser({ user }) {
      if (user.provider === "microsoft-entra-id" && user.accessToken) {
        try {
          await dbConnect();
          await User.findByIdAndUpdate(
            user.id,
            {
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              expiresAt: user.expiresAt,
              provider: user.provider,
            },
            { new: true }
          );
        } catch (error) {
          console.error("Error updating user with auth tokens:", error);
        }
      }
    },
  },

  callbacks: {
    // This callback will modify the user before it's created in the database
    async signIn({ user, account }) {
      console.log("signIn called", user, account);

      // Add tokens to the user object when signing in with Microsoft
      if (account && account.provider === "microsoft-entra-id") {
        // Add these properties to the user object - they'll be saved during creation
        user.accessToken = account.access_token;
        user.refreshToken = account.refresh_token;
        user.expiresAt = account.expires_at;
        user.provider = account.provider;
      }

      return true;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string;
      }
      if (token.image && session.user) {
        session.user.image = token.image as string;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      if (token.refreshToken) {
        session.refreshToken = token.refreshToken as string;
      }
      if (token.expiresAt) {
        session.expiresAt = token.expiresAt as number;
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.image = user.image;
      }

      // Store tokens in JWT when account is available
      if (account && account.provider === "microsoft-entra-id") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (
        account &&
        account.expiresAt &&
        Date.now() < Number(account.expiresAt) * 1000
      ) {
        return token;
      }

      if (token?.email) {
        return token;
      }
      return null;
    },
  },

  // Use the standard adapter but add token fields to the user schema
  adapter: MongoDBAdapter(client),

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  ...authConfig,
});
