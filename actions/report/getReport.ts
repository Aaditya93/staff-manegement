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
      return [];
    }

    // Create the base query with proper type
    const baseQuery: {
      resolvedAt: { $exists: boolean };
      travelAgentId?: string;
      salesId?: string;
      reservationId?: string;
    } = { resolvedAt: { $exists: false } };

    // Add role-specific filters directly to the base query
    if (userRole === "TravelAgent") {
      baseQuery.travelAgentId = userId;
    } else if (userRole === "SalesStaff") {
      baseQuery.salesId = userId;
    } else if (userRole === "ReservationStaff") {
      baseQuery.reservationId = userId;
    }
    // Execute the query with the proper filter structure
    const reports = await Report.find(baseQuery)
      .lean()
      .populate([
        { path: "travelAgentId", select: "name email" }, // Add select to limit fields
        { path: "salesId", select: "name email" },
        { path: "reservationId", select: "name email" },
      ])
      .sort({ createdAt: -1 });

    return serializeData(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
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
