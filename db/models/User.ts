"use server";
import mongoose from "mongoose";

import dbConnect from "../db";
const accountSchema = new mongoose.Schema(
  {
    accessToken: String,
    refreshToken: String,
    expiresAt: Number,
    email: String,
    provider: String,
    emailUpdatedAt: Date,
  },
  { _id: true }
);
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    role: {
      type: String,
      enum: ["Admin", "TravelAgent", "Employee"],
      default: "Employee",
      required: true,
    },
    accounts: [accountSchema],

    country: String,
    provider: String,
    image: String,
    backgroundImage: String,
    emailVerified: Date,
  },
  { timestamps: true }
);

const User = (mongoose.models?.User ||
  mongoose.model("User", userSchema)) as ReturnType<typeof mongoose.model<any>>;

export default User;

export async function getUserById(id: string) {
  try {
    await dbConnect();
    const user = await User.findById(id).lean();

    return user;
  } catch (error) {
    console.error("Error while getting user by ID:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    await dbConnect();
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    console.error("Error while getting user by ID:", error);
    return null;
  }
}
export async function emailVerified(id: string) {
  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      id,
      { emailVerified: new Date() },
      { new: true }
    );

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
}
