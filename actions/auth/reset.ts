"use server";

import { ResetSchema } from "@/app/schemas";
import { getUserByEmail } from "@/db/models/User";
import * as z from "zod";
import { PasswordResetEmail } from "@/lib/mail";
import { generatePasswordToken } from "@/lib/token";
import dbConnect from "@/db/db";

export const resetPassword = async (values: z.infer<typeof ResetSchema>) => {
  await dbConnect();
  const validatedFeilds = ResetSchema.safeParse(values);

  if (!validatedFeilds.success) {
    return { error: "Invalid input feilds" };
  }

  const { email } = validatedFeilds.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "User not found" };
  }

  const passwordToken = await generatePasswordToken(email);

  await PasswordResetEmail(passwordToken.email, passwordToken.token);

  return { success: "Password reset email sent" };
};
