import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import client from "./lib/mongo";
import { emailVerified } from "./db/models/User";
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
  },
  callbacks: {
    // async authorized({ request, token }) {
    //   if (request.nextUrl.pathname === "/travel-agent") {
    //     if (token.role === "TravelAgent-1" || token.role === "TravelAgent-2") {
    //       return true;
    //     }
    //     return false;
    //   }
    // },
    // async signIn({ account }) {
    //   if (account?.provider !== "credentials") return true;
    // },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role;
      }
      if (token.image && session.user) {
        session.user.image = token.image as string;
      }
      if (token.companyId && session.user) {
        session.user.companyId = token.companyId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.image = user.image;
      }
      if (token?.email) {
        return token;
      }
      return null;
    },
  },

  adapter: MongoDBAdapter(client),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this matches in middleware

  trustHost: true,
  ...authConfig,
});
