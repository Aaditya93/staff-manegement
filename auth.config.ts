import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { authenticateUser } from "./db/models/User";
import { LoginSchema } from "./app/schemas";
export default {
  providers: [
    Credentials({
      authorize: async (credentials) => {
        // Validate the credentials against the schema
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          throw new Error("Invalid input data");
        }

        const { email, password } = validatedFields.data;
        const user = await authenticateUser({ email, password });
        if (user?.error) {
          return null;
        }

        return user;
      },
    }),

    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
      authorization: {
        params: {
          scope:
            "openid email profile offline_access User.Read Mail.ReadWrite  Mail.Send Mail.Read",
        },
      },
    }),
  ],
} satisfies NextAuthConfig;
