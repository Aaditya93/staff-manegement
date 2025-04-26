import mongoose, { Document, Model } from "mongoose";

interface IVerificationToken extends Document {
  token: string;
  email: string;
  expires: Date;
}

const verificationTokenSchema = new mongoose.Schema<IVerificationToken>({
  token: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  expires: { type: Date, required: true },
});

const EmailVerification: Model<IVerificationToken> =
  mongoose.models.EmailVerification ||
  mongoose.model<IVerificationToken>(
    "EmailVerification",
    verificationTokenSchema
  );

export default EmailVerification;

export const getVerificationTokenByEmail = async (
  email: string
): Promise<IVerificationToken | null> => {
  try {
    return await EmailVerification.findOne({ email });
  } catch (error) {
    console.error("Error fetching verification token by email:", error);
    return null;
  }
};

export const getVerificationTokenByToken = async (
  token: string
): Promise<IVerificationToken | null> => {
  try {
    return await EmailVerification.findOne({ token });
  } catch (error) {
    console.error("Error fetching verification token by token:", error);
    return null;
  }
};
