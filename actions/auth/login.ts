"use server";

import { LoginSchema } from "@/app/schemas";
import * as z from "zod";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

import { getUserByEmail } from "@/db/models/User";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFeilds = LoginSchema.safeParse(values);
  if (!validatedFeilds.success) {
    return { error: "Invalid input feilds" };
  }
  const { email, password } = validatedFeilds.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "User not found" };
  }
  if (!existingUser.emailVerified) {
    // const verificationToken = await generateToken(existingUser.email);
    // await sendVarificationEmail(
    //   verificationToken.email,
    //   verificationToken.token
    // );
    return {
      success: "Verification pending. Our team will review your details.",
    };
  }

  try {
    const response = await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    if (response === null) {
      return { error: "Invalid credentials" };
    }
    return response;
  } catch (error) {
    console.error("Error during login:", error);

    return { error: "Something went wrong" };
  }
};
