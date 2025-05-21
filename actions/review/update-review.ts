"use server";

import dbConnect from "@/db/db";
import User from "../../db/models/User";
import Ticket from "../../db/models/ticket";

export const updateReview = async () => {
  try {
    await dbConnect();
    // Find users with specified roles
    const users = await User.find({
      role: { $in: ["ReservationStaff", "SalesStaff"] },
    });

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 5);

    for (const user of users) {
      if (user.role === "ReservationStaff") {
        // Find tickets where this user is the reservation staff and a review exists
        const tickets = await Ticket.find({
          "reservationInCharge.id": user.id,
          review: { $exists: true },
        });

        if (tickets.length > 0) {
          // Get current user with existing ratings
          const currentUser = await User.findById(user.id);
          if (!currentUser) continue;

          // Get existing values
          const existingAttitude = currentUser.attitude || 0;
          const existingKnowledge = currentUser.knowledge || 0;

          const existingSpeed = currentUser.speed || 0;
          const existingReviewCount = currentUser.reviewcount || 0;

          // Calculate totals for new reviews
          let attitudeTotal = 0;
          let knowledgeTotal = 0;

          let speedTotal = 0;
          let newReviewCount = 0;

          // Calculate total for each category from new reviews
          for (const ticket of tickets) {
            if (ticket.review) {
              attitudeTotal += ticket.review.attitude;
              knowledgeTotal += ticket.review.knowledge;

              speedTotal += ticket.review.speed;
              newReviewCount++;
            }
          }

          // Calculate weighted averages including old reviews
          const totalReviewCount = existingReviewCount + newReviewCount;

          if (totalReviewCount > 0) {
            // Calculate new weighted averages
            const attitudeAvg = parseFloat(
              (
                (existingAttitude * existingReviewCount + attitudeTotal) /
                totalReviewCount
              ).toFixed(1)
            );
            const knowledgeAvg = parseFloat(
              (
                (existingKnowledge * existingReviewCount + knowledgeTotal) /
                totalReviewCount
              ).toFixed(1)
            );

            const speedAvg = parseFloat(
              (
                (existingSpeed * existingReviewCount + speedTotal) /
                totalReviewCount
              ).toFixed(1)
            );

            // Update user with calculated weighted averages and increment review count
            const result = await User.findByIdAndUpdate(user.id, {
              attitude: attitudeAvg,
              knowledge: knowledgeAvg,
              speed: speedAvg,
              reviewcount: totalReviewCount,
            });
            console.log("Updated user:", result);
          }
        }
      } else if (user.role === "SalesStaff") {
        const tickets = await Ticket.find({
          "salesStaff.id": user.id,
          review: { $exists: true },
        });

        if (tickets.length > 0) {
          // Get current user with existing ratings
          const currentUser = await User.findById(user.id);
          if (!currentUser) continue;

          // Get existing values
          const existingAttitude = currentUser.attitude || 0;
          const existingKnowledge = currentUser.knowledge || 0;

          const existingSpeed = currentUser.speed || 0;
          const existingReviewCount = currentUser.reviewcount || 0;

          // Calculate totals for new reviews
          let attitudeTotal = 0;
          let knowledgeTotal = 0;

          let speedTotal = 0;
          let newReviewCount = 0;

          // Calculate total for each category from new reviews
          for (const ticket of tickets) {
            if (ticket.review) {
              attitudeTotal += ticket.review.attitude;
              knowledgeTotal += ticket.review.knowledge;
              speedTotal += ticket.review.speed;
              newReviewCount++;
            }
          }

          // Calculate weighted averages including old reviews
          const totalReviewCount = existingReviewCount + newReviewCount;

          if (totalReviewCount > 0) {
            // Calculate new weighted averages
            const attitudeAvg = parseFloat(
              (
                (existingAttitude * existingReviewCount + attitudeTotal) /
                totalReviewCount
              ).toFixed(1)
            );
            const knowledgeAvg = parseFloat(
              (
                (existingKnowledge * existingReviewCount + knowledgeTotal) /
                totalReviewCount
              ).toFixed(1)
            );

            const speedAvg = parseFloat(
              (
                (existingSpeed * existingReviewCount + speedTotal) /
                totalReviewCount
              ).toFixed(1)
            );

            // Update user with calculated weighted averages and increment review count
            const result = await User.findByIdAndUpdate(user.id, {
              attitude: attitudeAvg,
              knowledge: knowledgeAvg,
              speed: speedAvg,
              reviewcount: totalReviewCount,
            });
            console.log("Updated user:", result);
          }
        }
      }
    }
    console.log("Reviews updated successfully");

    return { success: true, message: "Reviews updated successfully" };
  } catch (error) {
    console.error("Error updating reviews:", error);
    return { success: false, error: error };
  }
};

/**
 * Deletes the review section from all tickets in the database that have reviews
 * @returns Object containing success status, message, and count of deleted reviews
 */
export const deleteAllReviews = async () => {
  try {
    // Connect to database
    await dbConnect();

    // Find all tickets that have reviews
    const ticketsWithReviews = await Ticket.find({ review: { $exists: true } });

    if (ticketsWithReviews.length === 0) {
      return {
        success: true,
        message: "No tickets with reviews found in the database",
        count: 0,
      };
    }

    // Delete reviews from all matching tickets using $unset
    const result = await Ticket.updateMany(
      { review: { $exists: true } },
      { $unset: { review: "" } }
    );

    if (result.modifiedCount > 0) {
      console.log(`Deleted reviews from ${result.modifiedCount} tickets`);
      return {
        success: true,
        message: `Successfully deleted reviews from ${result.modifiedCount} tickets`,
        count: result.modifiedCount,
      };
    } else {
      return {
        success: false,
        message: "Failed to delete reviews",
        count: 0,
      };
    }
  } catch (error) {
    console.error("Error deleting reviews:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      count: 0,
    };
  }
};

export const resetUserReviews = async () => {
  try {
    // Connect to database
    await dbConnect();

    // Find users that have at least one of the review metrics
    const usersWithReviews = await User.find({
      $or: [
        { attitude: { $exists: true } },
        { knowledge: { $exists: true } },
        { speed: { $exists: true } },
        { reviewcount: { $exists: true } },
      ],
    });

    if (usersWithReviews.length === 0) {
      return {
        success: true,
        message: "No users with review metrics found",
        count: 0,
      };
    }

    // Unset all review-related fields using $unset operator
    const result = await User.updateMany(
      {
        $or: [
          { attitude: { $exists: true } },
          { knowledge: { $exists: true } },
          { speed: { $exists: true } },
          { reviewcount: { $exists: true } },
        ],
      },
      {
        $unset: {
          attitude: "",
          knowledge: "",
          speed: "",
          reviewcount: "",
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`Reset review metrics for ${result.modifiedCount} users`);
      return {
        success: true,
        message: `Successfully reset review metrics for ${result.modifiedCount} users`,
        count: result.modifiedCount,
      };
    } else {
      return {
        success: false,
        message: "Failed to reset user review metrics",
        count: 0,
      };
    }
  } catch (error) {
    console.error("Error resetting user review metrics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      count: 0,
    };
  }
};
