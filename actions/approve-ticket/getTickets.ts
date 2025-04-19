"use server";
import { auth } from "@/auth";

import Ticket, { ITicket } from "../../db/models/ticket";
import { revalidatePath } from "next/cache";
/**
 * Retrieves all tickets belonging to a specific user
 * @param userId - The ID of the user whose tickets to retrieve
 * @returns A promise that resolves to an array of ticket documents
 */
export async function getTickets(): Promise<ITicket[]> {
  try {
    const session = await auth();
    const tickets = await Ticket.find({
      userId: session?.user.id,
      isApproved: false,
    });
    return tickets;
  } catch (error) {
    console.error("Error fetching tickets by userId:", error);
    throw new Error(`Failed to get tickets for user`);
  }
}

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
