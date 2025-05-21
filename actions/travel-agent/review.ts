"use server";
import { revalidatePath } from "next/cache";
import Ticket from "@/db/models/ticket";
import User from "@/db/models/User";
import dbConnect from "@/db/db";
import { sendReviewNotificationEmail } from "@/lib/mail";
import { auth } from "@/auth";
interface ReviewData {
  ticketId: string;
  attitude: number;
  knowledge: number;
  speed: number;
  reviewTitle: string;
  positiveText: string;
  negativeText: string;
}

// ...existing code...

export async function submitTicketReview(reviewData: ReviewData) {
  try {
    // Connect to database
    await dbConnect();
    const session = await auth();

    if (!session || !session.user) {
      return {
        success: false,
        error: "You must be logged in to submit a review.",
      };
    }

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

    // Find the ticket first to get details needed for the email
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return { success: false, error: "Ticket not found." };
    }

    // Update the ticket with the review
    ticket.review = {
      ...reviewFields,
      userRole: session.user.role,
      reviewDate: new Date(),
    };
    await ticket.save();

    // Get travel agent details for the email notification
    const travelAgentName = session.user.name || "Travel Agent";
    const travelAgentEmail = session.user.email || "";

    // Create travel agent info object for email
    const travelAgentInfo = {
      name: travelAgentName,
      email: travelAgentEmail,
    };

    // After updating the ticket, update the associated user ratings
    if (ticket.reservationInCharge?.id) {
      await updateUserRatings(ticket.reservationInCharge.id, reviewFields);

      // Send email notification to reservation staff
      try {
        const reservationStaff = await User.findById(
          ticket.reservationInCharge.id
        );
        if (reservationStaff && reservationStaff.email) {
          await sendReviewNotificationEmail(
            reservationStaff.email,
            reservationStaff.name || "Staff Member",
            { ...reviewFields, ticketId },
            ticket.companyName || "Unknown Company",
            ticket.destination || "Unknown Destination",
            travelAgentInfo
          );
        }
      } catch (emailError) {
        console.error(
          "Error sending notification email to reservation staff:",
          emailError
        );
      }
    }

    if (ticket.salesInCharge?.id) {
      await updateUserRatings(ticket.salesInCharge.id, reviewFields);

      // Send email notification to sales staff
      try {
        const salesStaff = await User.findById(ticket.salesInCharge.id);
        if (salesStaff && salesStaff.email) {
          await sendReviewNotificationEmail(
            salesStaff.email,
            salesStaff.name || "Staff Member",
            { ...reviewFields, ticketId },
            ticket.companyName || "Unknown Company",
            ticket.destination || "Unknown Destination",
            travelAgentInfo
          );
        }
      } catch (emailError) {
        console.error(
          "Error sending notification email to sales staff:",
          emailError
        );
      }
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

// Helper function to update user ratings
async function updateUserRatings(
  userId: string,
  reviewFields: Omit<ReviewData, "ticketId">
) {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return;

    // Check if user role is either ReservationStaff or SalesStaff
    if (!["ReservationStaff", "SalesStaff"].includes(currentUser.role)) {
      return;
    }

    // Get existing values
    const existingAttitude = currentUser.attitude || 0;
    const existingKnowledge = currentUser.knowledge || 0;
    const existingSpeed = currentUser.speed || 0;
    const existingReviewCount = currentUser.reviewcount || 0;

    // Add new review data
    const newAttitude = reviewFields.attitude;
    const newKnowledge = reviewFields.knowledge;
    const newSpeed = reviewFields.speed;

    // Calculate weighted averages including this new review
    const totalReviewCount = existingReviewCount + 1;

    const attitudeAvg = parseFloat(
      (
        (existingAttitude * existingReviewCount + newAttitude) /
        totalReviewCount
      ).toFixed(1)
    );
    const knowledgeAvg = parseFloat(
      (
        (existingKnowledge * existingReviewCount + newKnowledge) /
        totalReviewCount
      ).toFixed(1)
    );
    const speedAvg = parseFloat(
      (
        (existingSpeed * existingReviewCount + newSpeed) /
        totalReviewCount
      ).toFixed(1)
    );

    // Update user with new weighted averages
    const result = await User.findByIdAndUpdate(userId, {
      attitude: attitudeAvg,
      knowledge: knowledgeAvg,
      speed: speedAvg,
      reviewcount: totalReviewCount,
    });
    console.log("Updated user ratings:", result);

    console.log(`Updated ratings for user ${userId}`);
  } catch (error) {
    console.error(`Error updating ratings for user ${userId}:`, error);
  }
}
