"use server";

import Report from "@/db/models/report";
import dbConnect from "@/db/db";

export async function createReport(formData: any) {
  try {
    // Connect to the database
    await dbConnect();

    // Create a new report object
    const report = {
      title: formData.title,
      description: formData.description,
      complaintType: formData.complaintType,
      ticketId: formData.ticketId,
      travelAgentId: formData.travelAgent,
      salesId: formData.sales,
      reservationId: formData.reservation,
    };

    // Save the report to the database
    const newReport = await Report.create(report);

    return {
      success: true,
      message: "Report submitted successfully",
      reportId: newReport._id.toString(),
    };
  } catch (error) {
    console.error("Error creating report:", error);

    return {
      success: false,
      message: "Failed to submit report",
    };
  }
}
