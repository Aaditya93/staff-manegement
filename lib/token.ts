import { v4 as uuidv4 } from "uuid";
import { getVerificationTokenByEmail } from "@/db/models/EmailVerification";
import EmailVerification from "@/db/models/EmailVerification";
import PasswordReset, {
  getPasswordResetTokenByEmail,
} from "@/db/models/PasswordToken";
import dbConnect from "@/db/db";

export const generateToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await EmailVerification.findByIdAndDelete(existingToken.id);
  }

  const newToken = await EmailVerification.create({
    token,
    email,
    expires,
  });

  return newToken;
};

export const generatePasswordToken = async (email: string) => {
  await dbConnect();
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  const existingToken = await getPasswordResetTokenByEmail(email);
  if (existingToken) {
    await PasswordReset.findByIdAndDelete(existingToken.id);
  }
  const newToken = await PasswordReset.create({
    token,
    email,
    expires,
  });
  return newToken;
};

export default generateToken;
