"use server";
import { revalidatePath } from "next/cache";
import Ticket from "@/db/models/ticket";
import dbConnect from "@/db/db";
interface ReviewData {
  ticketId: string;
  attitude: number;
  knowledge: number;
  speed: number;
  reviewTitle: string;
  positiveText: string;
  negativeText: string;
}

export async function submitTicketReview(reviewData: ReviewData) {
  try {
    // Connect to database
    await dbConnect();

    const { ticketId, ...reviewFields } = reviewData;

    // Validate numeric rating fields
    const ratingFields = ["attitude", "knowledge", "speed"];
    const invalidRatings = ratingFields.filter((key) => {
      const rating = Number(reviewFields[key as keyof typeof reviewFields]);
      return rating !== 0 && (rating < 1 || rating > 5);
    });

    if (invalidRatings.length > 0) {
      return {
        success: false,
        error: `Invalid ratings for: ${invalidRatings.join(", ")}. Ratings must be between 1-5.`,
      };
    }

    console.log("Review data before submission:", reviewFields);

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

    revalidatePath(`/travel-agent/ticket/${ticketId}`);

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
