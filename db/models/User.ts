import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dbConnect from "../db";
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
      ema: ["User", "Admin", "TravelAgent"],
      default: "User",
      required: true,
    },
    password: String,
    image: String,
    emailVerified: Date,
    companyId: String,
  },
  { timestamps: true }
);

const User = (mongoose.models?.User ||
  mongoose.model("User", userSchema)) as ReturnType<typeof mongoose.model<any>>;

export default User;

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    await dbConnect();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: "User already exists" };
    }

    // Hash the password with a salt round of 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user document
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "User",
      image: null,
      emailVerified: null,
    });

    // Save the user to the database
    await newUser.save();
    return { success: "Conformation Email Sent" };
  } catch (error) {
    console.error("Error during registration:", error);
    return { error: "Error while registering" };
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

export async function getUserById(id: string) {
  try {
    await dbConnect();
    const user = await User.findById(id);
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
