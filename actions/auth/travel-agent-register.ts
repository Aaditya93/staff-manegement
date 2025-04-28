"use server";

import TravelAgentUser from "@/db/models/travelAgentUser";
import * as z from "zod";
import dbConnect from "@/db/db";
import { TravelAgentRegisterSchema } from "@/app/schemas";
import User from "@/db/models/User";
import bcrypt from "bcryptjs";

import { sendVarificationEmail } from "@/lib/mail";
import { generateToken } from "@/lib/token";
export const registerTravelAgent = async (
  values: z.infer<typeof TravelAgentRegisterSchema>
) => {
  try {
    await dbConnect();
    const validatedFields = TravelAgentRegisterSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: "Invalid input",
      };
    }

    const { name, email, password, company, phoneNumber, address, country } =
      validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 12);

    const existingTravelAgent = await TravelAgentUser.findOne({
      email: email,
    });
    if (existingTravelAgent) {
      const travelAgent = await TravelAgentUser.findOneAndUpdate(
        {
          email: email,
        },
        {
          name,
          password: hashedPassword,
          company,
          address,
          phoneNumber,
          country,
        },
        { new: true } // Return the updated document
      );
      const existingUser = await User.findOneAndUpdate(
        {
          email: email,
        },
        {
          name,
          password: hashedPassword,
          provider: "credentials",
        },
        { new: true } // Return the updated document
      );

      const verificationToken = await generateToken(existingUser.email);
      await sendVarificationEmail(
        verificationToken.email,
        verificationToken.token
      );
      return {
        success: "Confirmation email sent",
      };
    }

    const travelAgent = await TravelAgentUser.create({
      name,
      email,
      password: hashedPassword,
      company,
      address,
      phoneNumber,
      country,
    });
    await User.create({
      name,
      email,
      role: "TravelAgent",
      travelAgentId: travelAgent._id,
      provider: "credentials",
      password: hashedPassword,
    });
    const verificationToken = await generateToken(travelAgent.email);
    await sendVarificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    return {
      success: "Confirmation email sent",
    };
  } catch (error) {
    console.error("Error during registration:", error);
    return {
      error: "Internal server error",
    };
  }
};
