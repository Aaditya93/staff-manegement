"use server";
import { getVerificationTokenByToken } from "@/db/models/EmailVerification";
import User, { getUserByEmail } from "@/db/models/User";
import dbConnect from "@/db/db";
import EmailVerification from "@/db/models/EmailVerification";

const newVerification = async (token: string) => {
  dbConnect();
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return { error: "Invalid token" };
  }
  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Token has expired" };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: "Email doesn't exists" };
  }

  await User.findByIdAndUpdate(existingUser.id, { emailVerified: new Date() });

  await EmailVerification.findByIdAndDelete(existingToken.id);

  return { success: "Email verified" };
};
export default newVerification;
