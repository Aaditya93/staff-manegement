"use server";

import { sendEmail } from "@/actions/mail/send-email";
import dbConnect from "@/db/db";
import Ticket from "@/db/models/ticket";

interface PersonnelInfo {
  id: string;
  name: string;
  emailId: string;
}

interface SendConfirmationEmailParams {
  ticketId: string;
  reservationStaff: PersonnelInfo;
  salesStaff: PersonnelInfo;
  estimatedTimeInSeconds: number;
}

export async function sendConfirmationEmail({
  ticketId,
  reservationStaff,
  salesStaff,
  estimatedTimeInSeconds,
}: SendConfirmationEmailParams) {
  try {
    await dbConnect();

    // Get the ticket details to include in the email
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return { success: false, error: "Ticket not found" };
    }

    // Extract client email from the ticket
    const clientEmail = ticket.travelAgent?.emailId;
    if (!clientEmail) {
      return { success: false, error: "Client email not found in ticket" };
    }

    // Calculate estimated response time
    const currentTime = new Date();
    const responseTime = new Date(
      currentTime.getTime() + estimatedTimeInSeconds * 1000
    );
    const formattedResponseTime = responseTime.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Construct email content
    const subject = `Victoria Tours: Confirmation of Receipt - Ticket #${ticketId}`;

    const body = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #003366; font-size: 28px; margin-bottom: 5px;">Victoria Tours</h1>
          <p style="color: #666; font-style: italic; margin-top: 0;">Creating unforgettable travel experiences since 1995</p>
          <div style="height: 3px; background: linear-gradient(to right, #003366, #66a3cc); margin: 20px 0;"></div>
        </div>
        
        <h2 style="color: #003366; font-size: 22px;">Thank You for Your Inquiry!</h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Dear ${
          ticket.travelAgent?.name || "Valued Customer"
        },</p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">We are pleased to confirm that we have received your travel request for <strong style="color: #003366;">${
          ticket.destination
        }</strong>.</p>
        
        <div style="background-color: #f7f9fc; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #003366; margin-top: 0;">Your Ticket Details:</h3>
          <ul style="padding-left: 20px; color: #333; line-height: 1.6;">
            <li><strong>Ticket ID:</strong> <span style="color: #003366;">${ticketId}</span></li>
            <li><strong>Destination:</strong> ${ticket.destination}</li>
            <li><strong>Arrival Date:</strong> ${new Date(
              ticket.arrivalDate || ""
            ).toLocaleDateString()}</li>
            <li><strong>Departure Date:</strong> ${new Date(
              ticket.departureDate || ""
            ).toLocaleDateString()}</li>
            <li><strong>Number of Passengers:</strong> ${ticket.pax}</li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Our team has started working on your request. <strong style="color: #003366;">You can expect to hear back from us before ${formattedResponseTime}</strong> with all necessary information.</p>
        
        <div style="background-color: #eaf4ff; padding: 20px; border-left: 4px solid #003366; border-radius: 4px; margin: 20px 0;">
          <h3 style="color: #003366; margin-top: 0;">Your Dedicated Victoria Tours Team:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 50%;">
                <p style="margin: 0;"><strong>Sales Representative:</strong><br>${
                  salesStaff.name
                }</p>
              </td>
              <td style="padding: 8px; width: 50%;">
                <p style="margin: 0;"><strong>Reservation Specialist:</strong><br>${
                  reservationStaff.name
                }</p>
              </td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">To help us serve you better, please include the Ticket ID <strong style="color: #003366;">${ticketId}</strong> in all future correspondence regarding this inquiry.</p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Thank you for choosing Victoria Tours for your travel needs.</p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #333;">Best regards,<br />
        <strong>Victoria Tours Customer Service Team</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
          <p>This is an automated message. Please do not reply directly to this email.</p>
          <p>© ${new Date().getFullYear()} Victoria Tours. All rights reserved.</p>
        </div>
      </div>
    `;

    // Get inbox number from your system (you might need to adjust this)
    const inboxNumber = 0; // Default inbox number

    // Send the email
    const result = await sendEmail({
      subject,
      body,
      toRecipients: [clientEmail],
      ccRecipients: [reservationStaff.emailId, salesStaff.emailId],
      inboxNumber,
    });

    if (!result.success) {
      console.error("Failed to send confirmation email:", result.error);
      return { success: false, error: result.error };
    }

    // Update the ticket to record that confirmation was sent
    await Ticket.updateOne(
      { _id: ticketId },
      {
        $set: {
          confirmationEmailSent: true,
          confirmationEmailSentAt: new Date(),
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
