import mongoose, { Model, Document, Schema } from "mongoose";

// Define an interface for the document
interface IPasswordResetToken extends Document {
  token: string;
  email: string;
  expires: Date;
}

// Define the schema with types
const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  token: { type: String, unique: true, required: true },
  email: { type: String, required: true },
  expires: { type: Date, required: true },
});

// Define the model
const PasswordReset: Model<IPasswordResetToken> =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordResetToken>(
    "PasswordReset",
    passwordResetTokenSchema
  );

export default PasswordReset;

export const getPasswordResetTokenByToken = async (
  token: string
): Promise<IPasswordResetToken | null> => {
  try {
    const passwordResetToken = await PasswordReset.findOne({ token });
    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (
  email: string
): Promise<IPasswordResetToken | null> => {
  try {
    const passwordResetToken = await PasswordReset.findOne({ email });
    return passwordResetToken;
  } catch {
    return null;
  }
};
