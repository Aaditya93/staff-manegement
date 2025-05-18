"use server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
      index: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      required: true,
      index: true,
    },
    office: {
      type: String,
    },
    department: {
      type: String,
    },
    bio: {
      type: String,
    },
    status: {
      type: String,
    },
    attitude: {
      type: Number,
    },
    knowledge: {
      type: Number,
    },

    speed: {
      type: Number,
    },
    reviewcount: {
      type: Number,
      default: 0,
    },

    position: {
      type: String,
    },
    accounts: [accountSchema],
    travelAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TravelAgentUser",
    },
    destination: {
      type: [String],
      default: [],
    },
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

export async function authenticateUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    // Check if the user exists
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user) {
      return { error: "User does not exist" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "Invalid password" };
    }

    return user;
  } catch (error) {
    console.error("Error during authentication:", error);
    return { error: "Error while authenticating" };
  }
}
