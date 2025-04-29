"use server";

import { revalidatePath } from "next/cache";

import Ticket from "@/db/models/ticket";

import dbConnect from "@/db/db";

interface ReviewData {
  attitude: number;
  knowledge: number;
  services: number;
  speed: number;
  hotel: number;
  guide: number;
  transfer: number;
  meal: number;
  reviewText: string;
  ticketId: string;
}

export async function submitTicketReview(reviewData: ReviewData) {
  try {
    // Connect to database
    await dbConnect();

    const { ticketId, ...reviewFields } = reviewData;

    // Validate review data before submission
    const invalidRatings = Object.entries(reviewFields)
      .filter(
        ([key, value]) => key !== "reviewText" && (value < 1 || value > 5)
      )
      .map(([key]) => key);

    if (invalidRatings.length > 0) {
      return {
        success: false,
        error: `Invalid ratings for: ${invalidRatings.join(", ")}. Ratings must be between 1-5.`,
      };
    }

    // Find and update the ticket with the review
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      {
        review: {
          ...reviewFields,
          reviewDate: new Date(),
        },
      },
      { new: true }
    );
    console.log("Updated ticket:", updatedTicket);

    if (!updatedTicket) {
      return { success: false, error: "Ticket not found." };
    }

    revalidatePath(`/tickets/${ticketId}`);

    return {
      success: true,
      message: "Review submitted successfully.",
    };
  } catch (error) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit review.",
    };
  }
}
