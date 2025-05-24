import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import client from "./lib/mongo";
import User, { emailVerified } from "./db/models/User";
import dbConnect from "./db/db";
import { User as NextAuthUser } from "next-auth";
import { refreshAccessToken, updateUserTokens } from "./actions/auth/token";

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
              emailUpdatedAt: new Date(),
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
      if (account && account.provider === "microsoft-entra-id") {
        // For Microsoft 365 accounts, try to extract email from token
        if (!user.email && account.id_token) {
          try {
            const parts = account.id_token.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(
                Buffer.from(parts[1], "base64").toString()
              );
              const extractedEmail =
                payload.email ||
                payload.preferred_username ||
                payload.upn ||
                payload.unique_name;

              if (extractedEmail) {
                user.email = extractedEmail;
                console.log(
                  "Found email in token during signIn:",
                  extractedEmail
                );
              }
            }
          } catch (error) {
            console.error("Error parsing id_token during signIn:", error);
          }
        }

        // If still no email but we have a name, create a fallback email
        if (!user.email && user.name) {
          user.email = `${user.name.replace(/\s+/g, "").toLowerCase()}@placeholder.com`;
          console.log("Using fallback email during signIn:", user.email);
        } else if (!user.email && user.id) {
          user.email = `user-${user.id.substring(0, 8)}@placeholder.com`;
          console.log(
            "Using ID-based fallback email during signIn:",
            user.email
          );
        }

        user.accounts = [
          {
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            expiresAt: account.expires_at,
            email: user.email,
            provider: account.provider,
            emailUpdatedAt: new Date(),
          },
        ];
      }
      if (user.id && user.email) {
        try {
          await dbConnect();
          await User.findByIdAndUpdate(
            user.id,
            {
              email: user.email,
              // Update email in accounts array if it exists
              $set: {
                "accounts.$[].email": user.email,
                "accounts.$[].emailUpdatedAt": new Date(),
              },
            },
            { new: true }
          );
          console.log("Updated user email in database:", user.email);
        } catch (error) {
          console.error("Error updating user email in database:", error);
        }
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
        session.user.role = token.role as string;
      }
      if (token.accounts) {
        session.user.accounts = token.accounts as {
          _id?: string;
          accessToken?: string;
          refreshToken?: string;
          provider?: string;
          email?: string;
          emailUpdatedAt?: Date;
        }[];
      }

      // Ensure session always has an email
      if (token.email && session.user && !session.user.email) {
        session.user.email = token.email as string;
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
        if (user) {
          token.accounts = user.accounts;

          // Try to extract email from Microsoft 365 account information
          if (!user.email && account.id_token) {
            try {
              // Decode the id_token to get user information
              const parts = account.id_token.split(".");
              if (parts.length === 3) {
                const payload = JSON.parse(
                  Buffer.from(parts[1], "base64").toString()
                );

                // Microsoft 365 accounts may have email in different places
                const extractedEmail =
                  payload.email ||
                  payload.preferred_username ||
                  payload.upn ||
                  payload.unique_name;

                if (extractedEmail) {
                  token.email = extractedEmail;
                  console.log("Found email in token:", extractedEmail);
                }
              }
            } catch (error) {
              console.error("Error parsing id_token:", error);
            }
          } else {
            token.email = user.email;
          }

          // If we still don't have an email, create a fallback
          if (!token.email && user.name) {
            // Generate a placeholder email from the name
            token.email = `${user.name.replace(/\s+/g, "").toLowerCase()}@placeholder.com`;
            console.log("Using fallback email:", token.email);
          } else if (!token.email && user.id) {
            token.email = `user-${user.id.substring(0, 8)}@placeholder.com`;
            console.log("Using ID-based fallback email:", token.email);
          }
        }
      }

      if (token?.accounts && token.accounts.length > 0) {
        const nowInSeconds = Math.floor(Date.now() / 1000);
        console.log("Current token email:", token.email);

        // Process each account in the token.accounts array
        for (let i = 0; i < token.accounts.length; i++) {
          const account = token.accounts[i];

          // Skip accounts without necessary properties
          if (!account.expiresAt || !account.refreshToken) continue;

          const tokenExpiryInSeconds = Math.floor(
            (account.expiresAt as number) / 1000
          );

          // Only refresh if token is about to expire
          if (tokenExpiryInSeconds < nowInSeconds + 30) {
            try {
              const refreshedTokens = await refreshAccessToken(
                account.refreshToken as string
              );

              if (refreshedTokens) {
                // Update the token in the account array
                token.accounts[i] = {
                  ...token.accounts[i],
                  accessToken: refreshedTokens.accessToken,
                  refreshToken: refreshedTokens.refreshToken,
                  expiresAt: refreshedTokens.expiresAt * 1000,
                };

                // Update the database asynchronously
                await updateUserTokens(token.email as string, i, {
                  accessToken: refreshedTokens.accessToken,
                  refreshToken: refreshedTokens.refreshToken,
                  expiresAt: refreshedTokens.expiresAt,
                  provider: account.provider || "microsoft-entra-id",
                });
              } else {
                console.error(`Failed to refresh token for account ${i}`);
              }
            } catch (error) {
              console.error(`Error refreshing token for account ${i}:`, error);
            }
          }
        }
      }

      // IMPORTANT: Always return the token, even if email is missing
      return token;
    },
  },

  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  ...authConfig,
});
