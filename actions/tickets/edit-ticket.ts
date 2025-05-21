"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";
import Ticket from "@/db/models/ticket";
import mongoose from "mongoose";
import dbConnect from "@/db/db";

// Ensure this schema matches the one in your form component
const formSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  companyName: z.string().min(2, "Company name is required"),
  arrivalDate: z.date({ required_error: "Arrival date is required" }),
  departureDate: z.date({ required_error: "Departure date is required" }),
  pax: z.string().min(1, "Number of passengers is required"),
  cost: z.string().min(1, "Cost is required"),
  speed: z.string().min(1, "Speed is required"),
  salesInCharge: z.string().min(1, "Sales in charge is required"),
  reservationInCharge: z.string().min(1, "Reservation in charge is required"),
  travelAgent: z.string().min(1, "Travel agent is required"),
  status: z.string().min(1, "Status is required"),
  market: z.string().optional(),
});

export async function updateTicket(
  ticketId: string,
  formData: z.infer<typeof formSchema>,
  employeesData: any[]
) {
  try {
    await dbConnect();

    // Find the personnel information based on IDs
    const salesPerson = employeesData.find(
      (emp) => emp._id.toString() === formData.salesInCharge
    );
    const reservationPerson = employeesData.find(
      (emp) => emp._id.toString() === formData.reservationInCharge
    );
    const travelAgent = employeesData.find(
      (emp) => emp._id.toString() === formData.travelAgent
    );

    // Format the data to match the Ticket model structure
    const updatedTicketData = {
      destination: formData.destination,
      companyName: formData.companyName,
      arrivalDate: formData.arrivalDate,
      departureDate: formData.departureDate,
      pax: parseInt(formData.pax, 10),
      cost: parseFloat(formData.cost),
      speed: formData.speed,
      market: formData.market || "",
      status: formData.status,

      // Format personnel data according to the schema
      salesInCharge: salesPerson
        ? {
            id: salesPerson._id.toString(),
            name: salesPerson.name,
            emailId: salesPerson.email,
          }
        : undefined,

      reservationInCharge: reservationPerson
        ? {
            id: reservationPerson._id.toString(),
            name: reservationPerson.name,
            emailId: reservationPerson.email,
          }
        : undefined,

      travelAgent: travelAgent
        ? {
            id: travelAgent._id.toString(),
            name: travelAgent.name,
            emailId: travelAgent.email,
          }
        : undefined,
    };

    // Update the ticket in the database
    const objectId = new mongoose.Types.ObjectId(ticketId);
    const updatedTicket = await Ticket.findByIdAndUpdate(
      objectId,
      { $set: updatedTicketData },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      throw new Error("Ticket not found");
    }

    // Revalidate the tickets page to reflect the changes
    revalidatePath("/tickets");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update ticket:", error.message);
    return { success: false, error: error.message };
  }
}

// Define the validation schema for the form data
const UpdateStatusSchema = z.object({
  ticketId: z.string({
    required_error: "Ticket ID is required",
  }),
  status: z.enum(
    [
      "pending",
      "quote_sent",
      "negotiating",
      "in_progress",
      "completed",
      "cancelled",
    ],
    {
      required_error: "Status is required",
    }
  ),
});

export async function updateTicketStatus(formData: {
  ticketId: string;
  status: string;
}) {
  console.log("Updating ticket status with data:", formData);
  try {
    // Validate the form data
    const validatedData = UpdateStatusSchema.parse(formData);
    const { ticketId, status } = validatedData;

    // Connect to the database
    await dbConnect();

    // Update the ticket status
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    // Revalidate the dashboard page to reflect the changes
    revalidatePath("/dashboard");

    return { success: true, message: "Status updated successfully" };
  } catch (error) {
    console.error("Error updating ticket status:", error);

    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors[0].message };
    }

    return { success: false, message: "Failed to update ticket status" };
  }
}
