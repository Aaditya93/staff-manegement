"use server";
import { auth } from "@/auth";

import Ticket from "../../db/models/ticket";
import { revalidatePath } from "next/cache";
import dbConnect from "@/db/db";
import User from "@/db/models/User";

export const getAllUnApprovedTickets = async () => {
  try {
    await dbConnect();

    let query: any = {};
    const session = await auth();
    const email = session?.user?.email;
    const role = session?.user?.role;

    // Search based on role if provided
    if (role) {
      if (role === "SalesStaff") {
        query = {
          isApproved: false,
          "salesInCharge.emailId": email,
        };
      } else if (role === "ReservationStaff") {
        query = {
          isApproved: false,
          "reservationInCharge.emailId": email,
        };
      } else if (role === "TravelAgent") {
        query = {
          isApproved: false,
          "travelAgent.emailId": email,
        };
      }
    } else {
      // If no role specified, search in all staff fields
      query = {
        isApproved: false,
        $or: [
          { "salesInCharge.emailId": email },
          { "reservationInCharge.emailId": email },
          { "travelAgent.emailId": email },
        ],
      };
    }

    const tickets = await Ticket.find(query).lean();
    return tickets;
  } catch (error) {
    console.error("Error fetching tickets by email:", error);
    throw error;
  }
};

export async function approveTicket(
  ticketId: string,
  reservationInCharge: {
    id: string;
    name: string;
    emailId: string;
  },
  salesInCharge: {
    id: string;
    name: string;
    emailId: string;
  }
) {
  try {
    await dbConnect();

    // Basic validation
    if (!ticketId || !reservationInCharge || !salesInCharge) {
      return {
        success: false,
        error: "Missing required information",
      };
    }

    // Create clean objects to avoid any unexpected properties
    const cleanReservation = {
      id: reservationInCharge.id,
      name: reservationInCharge.name,
      emailId: reservationInCharge.emailId,
    };

    const cleanSales = {
      id: salesInCharge.id,
      name: salesInCharge.name,
      emailId: salesInCharge.emailId,
    };

    // Use updateOne instead of findByIdAndUpdate for simplicity
    const result = await Ticket.updateOne(
      { _id: ticketId },
      {
        $set: {
          isApproved: true,
          reservationInCharge: cleanReservation,
          salesInCharge: cleanSales,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        error: "Ticket not found or no changes made",
      };
    }

    // Revalidate the path
    revalidatePath("/pending-tickets");

    return { success: true };
  } catch (error) {
    console.error("Error approving ticket:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
export const getAllEmployees = async () => {
  try {
    await dbConnect();
    const result = User.find({
      role: { $in: ["ReservationStaff", "SalesStaff"] },
    }).lean();
    return result;
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};
