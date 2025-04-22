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
      if (role === "sales") {
        query = { "salesInCharge.emailId": email };
      } else if (role === "reservation") {
        query = { "reservationInCharge.emailId": email };
      } else if (role === "travelAgent") {
        query = { "travelAgent.emailId": email };
      }
    } else {
      // If no role specified, search in all staff fields
      query = {
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
  reservationInCharge: string // Add reservationInCharge parameter
) {
  try {
    // Validate if reservationInCharge is provided
    if (!reservationInCharge) {
      throw new Error("Reservation in charge is required.");
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        isApproved: true,
        reservationInCharge: reservationInCharge, // Set the reservationInCharge field
      },
      { new: true } // Return the updated document
    );

    if (!updatedTicket) {
      throw new Error("Ticket not found");
    }

    // Revalidate the path to update the UI after approval
    revalidatePath("/pending-tickets");

    return { success: true, ticket: updatedTicket };
  } catch (error) {
    console.error("Error approving ticket:", error);
    let errorMessage = "Failed to approve ticket.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Return specific error if validation failed
    if (errorMessage === "Reservation in charge is required.") {
      return { success: false, error: errorMessage };
    }
    // Generic error for other issues
    return {
      success: false,
      error: "An unexpected error occurred while approving the ticket.",
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
