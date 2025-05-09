"use server";
import { auth } from "@/auth";

import Ticket from "../../db/models/ticket";
import { revalidatePath } from "next/cache";
import dbConnect from "@/db/db";
import User from "@/db/models/User";
import { sendConfirmationEmail } from "./send-approval-mail";
import { convertTimeToSeconds } from "@/lib/utils";
import { serializeData } from "@/utils/serialize";
export const getAllUnApprovedTickets = async () => {
  try {
    await dbConnect();

    let query: any = {};
    const session = await auth();
    const email = session?.user?.email;
    const role = session?.user?.role;

    // Search based on role if provided
    if (role) {
      if (role === "SalesStaff") {
        query = {
          isApproved: false,
          "salesInCharge.emailId": email,
        };
      } else if (role === "ReservationStaff") {
        query = {
          isApproved: false,
          "reservationInCharge.emailId": email,
        };
      } else if (role === "TravelAgent") {
        query = {
          isApproved: false,
          "travelAgent.emailId": email,
        };
      }
    } else {
      // If no role specified, search in all staff fields
      query = {
        isApproved: false,
        $or: [
          { "salesInCharge.emailId": email },
          { "reservationInCharge.emailId": email },
          { "travelAgent.emailId": email },
        ],
      };
    }

    const tickets = await Ticket.find(query).lean();
    return tickets;
  } catch (error) {
    console.error("Error fetching tickets by email:", error);
    throw error;
  }
};

export async function approveTicket(
  ticketId: string,

  salesInCharge: {
    id: string;
    name: string;
    emailId: string;
  },
  estimatedTime: string
) {
  try {
    await dbConnect();
    const session = await auth();

    // Basic validation
    if (!ticketId || !salesInCharge || !estimatedTime) {
      return {
        success: false,
        error: "Missing required information",
      };
    }
    const estimatedTimeInSeconds = convertTimeToSeconds(estimatedTime);

    const cleanSales = {
      id: salesInCharge.id,
      name: salesInCharge.name,
      emailId: salesInCharge.emailId,
    };
    const approver = {
      id: session?.user.id || "",
      name: session?.user.name || "",
      emailId: session?.user.email || "",
    };

    // Use updateOne instead of findByIdAndUpdate for simplicity
    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: ticketId },
      {
        $set: {
          isApproved: true,
          salesInCharge: cleanSales,
          approvedBy: approver,
          estimateTimeToSendPrice: estimatedTimeInSeconds,
        },
      },
      { new: true } // This option returns the document after update
    );
    console.log("Update result:", updatedTicket);
    if (!updatedTicket) {
      return {
        success: false,
        error: "Ticket not found or no changes made",
      };
    }
    await sendConfirmationEmail({
      ticketId,
      reservationStaff: updatedTicket.reservationInCharge,
      salesStaff: salesInCharge,
      estimatedTimeInSeconds,
    });

    // Revalidate the path
    revalidatePath("/pending-tickets");

    return { success: true };
  } catch (error) {
    console.error("Error approving ticket:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
export const getAllEmployees = async () => {
  try {
    await dbConnect();
    const result = await User.find({}).lean();
    const seralizedResult = await serializeData(result);
    return seralizedResult;
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};

export async function deleteTicket(ticketId: string) {
  try {
    await dbConnect();

    // Find and delete the ticket
    await Ticket.findByIdAndDelete(ticketId);

    // Revalidate related paths to refresh the UI
    revalidatePath("/pending-tickets");

    return { success: true, message: "Ticket deleted successfully" };
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw new Error("Failed to delete ticket");
  }
}
