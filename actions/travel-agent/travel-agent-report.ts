"use server";

import Ticket, { ITicket } from "../../db/models/ticket";
import dbConnect from "@/db/db";
import User from "@/db/models/User";

export interface TicketFilterParams {
  userId: string;
  startDate: Date | string;
  endDate: Date | string;
  path?: string;
}

/**
 * Server action that fetches tickets for a specific user (either as reservation or sales in charge)
 * within the specified date range
 */
export async function getTicketsForTravelAgent({
  userId,
  startDate,
  endDate,
}: TicketFilterParams): Promise<{ tickets: ITicket[]; user: any }> {
  try {
    // Connect to database
    await dbConnect();

    // Format dates to ensure time is set to 00:00
    const formattedStartDate = new Date(startDate);
    formattedStartDate.setHours(0, 0, 0, 0);

    const formattedEndDate = new Date(endDate);
    formattedEndDate.setHours(23, 59, 59, 999); // End of day

    // Get user information

    const user = await User.findById(userId).lean();

    if (!user) {
      throw new Error("User not found");
    }

    // Build query to find tickets where the user is either reservation or sales in charge
    const tickets = await Ticket.find({
      $and: [
        { "travelAgent.id": userId },

        {
          createdAt: {
            $gte: formattedStartDate,
            $lte: formattedEndDate,
          },
        },
      ],
    }).sort({ createdAt: -1 });

    // Return both tickets and user information
    return {
      tickets: JSON.parse(JSON.stringify(tickets)),
      user: JSON.parse(JSON.stringify(user)),
    };
  } catch (error) {
    console.error("Error fetching tickets and user:", error);
    throw new Error(`Failed to fetch tickets and user: ${error}`);
  }
}
