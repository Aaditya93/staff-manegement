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
    console.log("Users found:", users);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

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
          const existingServices = currentUser.services || 0;
          const existingSpeed = currentUser.speed || 0;
          const existingReviewCount = currentUser.reviewcount || 0;

          // Calculate totals for new reviews
          let attitudeTotal = 0;
          let knowledgeTotal = 0;
          let servicesTotal = 0;
          let speedTotal = 0;
          let newReviewCount = 0;

          // Calculate total for each category from new reviews
          for (const ticket of tickets) {
            if (ticket.review) {
              attitudeTotal += ticket.review.attitude;
              knowledgeTotal += ticket.review.knowledge;
              servicesTotal += ticket.review.services;
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
            const servicesAvg = parseFloat(
              (
                (existingServices * existingReviewCount + servicesTotal) /
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
              services: servicesAvg,
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
          const existingServices = currentUser.services || 0;
          const existingSpeed = currentUser.speed || 0;
          const existingReviewCount = currentUser.reviewcount || 0;

          // Calculate totals for new reviews
          let attitudeTotal = 0;
          let knowledgeTotal = 0;
          let servicesTotal = 0;
          let speedTotal = 0;
          let newReviewCount = 0;

          // Calculate total for each category from new reviews
          for (const ticket of tickets) {
            if (ticket.review) {
              attitudeTotal += ticket.review.attitude;
              knowledgeTotal += ticket.review.knowledge;
              servicesTotal += ticket.review.services;
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
            const servicesAvg = parseFloat(
              (
                (existingServices * existingReviewCount + servicesTotal) /
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
              services: servicesAvg,
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
