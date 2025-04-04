import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import client from "./lib/mongo";
import User, { emailVerified } from "./db/models/User";
import dbConnect from "./db/db";
import { User as NextAuthUser } from "next-auth";
import { refreshAccessToken, updateUserTokens } from "./actions/auth/token";
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

      if (account && account.provider === "microsoft-entra-id") {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      if (token?.expiresAt && token.refreshToken) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        const tokenExpiryInSeconds = Math.floor(
          (token.expiresAt as number) / 1000
        );

        if (tokenExpiryInSeconds < nowInSeconds + 30) {
          try {
            const refreshedTokens = await refreshAccessToken(
              token.refreshToken as string
            );

            if (refreshedTokens) {
              token.accessToken = refreshedTokens.accessToken;
              token.refreshToken = refreshedTokens.refreshToken;
              token.expiresAt = refreshedTokens.expiresAt * 1000; // Convert to milliseconds if needed

              if (token.email) {
                await updateUserTokens(token.email as string, {
                  accessToken: refreshedTokens.accessToken,
                  refreshToken: refreshedTokens.refreshToken,
                  expiresAt: refreshedTokens.expiresAt,
                  provider: "microsoft-entra-id",
                });
              }
            } else {
              console.error("Failed to refresh token in JWT callback");
            }
          } catch (error) {
            console.error("Error refreshing token in JWT callback:", error);
          }
        }
      }

      if (token?.email) {
        return token;
      }
      return null;
    },
  },

  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  ...authConfig,
});
