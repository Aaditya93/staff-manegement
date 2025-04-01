import { type DefaultSession } from "next-auth";

export type ExtenedUser = DefaultSession["User"] & {
  role: "Admin" | "User" | "TravelAgent" | "Employee";
};
declare module "next-auth" {
  interface Session {
    user: ExtenedUser;
  }
}
