import { NextAuthConfig } from "next-auth";

import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

export default {
  providers: [
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
