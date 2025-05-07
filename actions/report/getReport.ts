"use server";
import { auth } from "@/auth";
import dbConnect from "@/db/db";
import Report from "@/db/models/report";
import { serializeData } from "@/utils/serialize";
import { revalidatePath } from "next/cache";

export const getAllReports = async () => {
  try {
    await dbConnect();
    const session = await auth();
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    if (!userId) {
      // Handle case where user is not logged in or ID is missing
      return []; // Or throw an error, depending on desired behavior
    }

    let whereClause = {};

    if (userRole === "Admin") {
      // Admins get all reports, no specific where clause needed based on user ID
    } else if (userRole === "TravelAgent") {
      whereClause = { travelAgentId: userId };
    } else if (userRole === "SalesStaff") {
      whereClause = { salesId: userId };
    } else if (userRole === "ReservationStaff") {
      whereClause = { reservationId: userId };
    } else {
      // Handle other roles or unexpected roles if necessary
      return []; // Or throw an error
    }

    const reports = await Report.find({
      resolvedAt: { $exists: false }, // Only include reports where resolvedAt field does not exist
      // where: whereClause, // Use the dynamically constructed where clause
    })
      .lean()
      .populate([
        { path: "travelAgentId" },
        { path: "salesId" },
        { path: "reservationId" },
      ])
      .sort({ createdAt: -1 }); // This replaces the order: [["createdAt", "DESC"]] syntax
    const serializedReports = serializeData(reports);

    return serializedReports;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error; // Re-throw the error after logging
  }
};

export async function resolveReport(reportId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Connect to the database
    await dbConnect();
    console.log(reportId);

    // Find and update the report with the current timestamp
    const result = await Report.findByIdAndUpdate(
      reportId,
      {
        resolvedAt: new Date(),
      },
      { new: true } // Return the updated document
    );

    // Check if report was found and updated
    if (!result) {
      return {
        success: false,
        message: "Report not found",
      };
    }

    revalidatePath("/reports");

    return {
      success: true,
      message: "Report successfully marked as resolved",
    };
  } catch (error) {
    console.error("Error resolving report:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to resolve report",
    };
  }
}
