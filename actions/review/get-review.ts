"use server";

import Ticket, { ITicket } from "@/db/models/ticket";
import User from "@/db/models/User";
import dbConnect from "@/db/db";

export async function getReviewedTickets(id: string): Promise<{
  tickets: ITicket[];
}> {
  try {
    await dbConnect();

    const tickets = await Ticket.find({
      $or: [{ "salesInCharge.id": id }, { "reservationInCharge.id": id }],
      review: { $exists: true },
    })
      .select({
        _id: 1,
        companyName: 1,
        destination: 1,
        pax: 1,
        travelAgent: 1,
        review: 1,
        createdAt: 1,
      })
      .sort({ createdAt: -1 })
      .lean();

    return {
      tickets: tickets as ITicket[],
    };
  } catch (error) {
    console.error("Error fetching reviewed tickets:", error);
    throw new Error("Failed to fetch reviewed tickets");
  }
  // Removed the finally block since it doesn't do anything
  // In Next.js with serverless functions, connections are managed automatically
}

export const getUser = async (userId: string) => {
  try {
    await dbConnect();
    const user = await User.findById(userId).lean().select("-accounts");
    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Failed to fetch user data");
  }
};
