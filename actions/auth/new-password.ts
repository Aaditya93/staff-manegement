"use server";
import { PasswordResetSchema } from "@/app/schemas";
import * as z from "zod";
import PasswordReset, {
  getPasswordResetTokenByToken,
} from "@/db/models/PasswordToken";
import User, { getUserByEmail } from "@/db/models/User";
import bcrypt from "bcryptjs";
import dbConnect from "@/db/db";

export const newPassword = async (
  values: z.infer<typeof PasswordResetSchema>,
  token?: string | null
) => {
  await dbConnect();
  if (token === null) {
    return { error: "Missing token" };
  }
  const validatedFields = PasswordResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid input fields" };
  }

  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token as string);

  if (!existingToken) {
    return { error: "Invalid token" };
  }

  const hasexpired = new Date(existingToken.expires) < new Date();

  if (hasexpired) {
    return { error: "Token has expired" };
  }
  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "User not found" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.findByIdAndUpdate(existingUser.id, { password: hashedPassword });

  await PasswordReset.findByIdAndDelete(existingToken.id);

  return { success: "Password updated" };
};
