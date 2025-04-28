import dbConnect from "@/db/db";
import Ticket from "@/db/models/ticket";
import { auth } from "@/auth";
import { serializeData } from "@/utils/serialize";

export const getAllTicketsByEmail = async (fromDate?: Date, toDate?: Date) => {
  try {
    await dbConnect();

    let query: any = {};
    const session = await auth();
    const email = session?.user?.email;
    const role = session?.user?.role;

    // Search based on role if provided
    if (role) {
      if (role === "SalesStaff") {
        query = { "salesInCharge.emailId": email, isApproved: true };
      } else if (role === "ReservationStaff") {
        query = { "reservationInCharge.emailId": email, isApproved: true };
      } else if (role === "TravelAgent") {
        query = { "travelAgent.emailId": email, isApproved: true };
      }
    } else {
      // If no role specified, search in all staff fields
      query = {
        isApproved: true,
        $or: [
          { "salesInCharge.emailId": email },
          { "reservationInCharge.emailId": email },
          { "travelAgent.emailId": email },
        ],
      };
    }

    // Add date range filtering if dates are provided
    if (fromDate instanceof Date && toDate instanceof Date) {
      // Set fromDate to start of day (00:00:00.000)
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);

      // Set toDate to end of day (23:59:59.999)
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const tickets = await Ticket.find(query).lean();
    return tickets;
  } catch (error) {
    console.error("Error fetching tickets by email:", error);
    throw error;
  }
};

export const getTicketById = async (id: string) => {
  try {
    await dbConnect();
    const ticket = await Ticket.findById(id).lean();
    const serializedTicket = serializeData(ticket);

    if (!ticket) {
      throw new Error("Ticket not found");
    }
    return serializedTicket;
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    throw error;
  }
};
