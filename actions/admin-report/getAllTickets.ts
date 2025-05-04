"use server";

import dbConnect from "@/db/db";
import Ticket from "@/db/models/ticket";
import { serializeData } from "@/utils/serialize";

export const getAllTickets = async (fromDate?: Date, toDate?: Date) => {
  try {
    // Connect to the database
    await dbConnect();

    // Build query object based on date parameters
    const query: { createdAt?: { $gte?: Date; $lte?: Date } } = {};

    // Add date range filtering if dates are provided
    if (fromDate instanceof Date || toDate instanceof Date) {
      query.createdAt = {};

      if (fromDate instanceof Date) {
        // Set start of day for fromDate
        const startDate = new Date(fromDate);
        startDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = startDate;
      }

      if (toDate instanceof Date) {
        // Set end of day for toDate
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Fetch tickets from the database with date filter
    const tickets = await Ticket.find(query).lean();
    const serializedTickets = serializeData(tickets);
    return serializedTickets;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error("Could not fetch tickets");
  }
};
