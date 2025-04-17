import { type DefaultSession } from "next-auth";

export type ExtenedUser = DefaultSession["Employee"] & {
  role: "Admin" | "TravelAgent" | "Employee";
  _id?: string;
  accessToken: string;
  refreshToken: string;
  expriesAt: Date;
  emailUpdatedAt: Date;
  provider: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtenedUser;
  }
}
