"use server";

import { getValidAccessToken } from "@/actions/auth/token";
import { EmailAttachment } from "./types";

/**
 * Sends an email
 */
export async function sendEmail(emailData: {
  subject: string;
  body: string;
  toRecipients: string[];
  ccRecipients?: string[];
  inboxNumber?: number;
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getValidAccessToken(emailData.inboxNumber || 0);

    // Transform the attachments to the correct format for Microsoft Graph API
    const formattedAttachments =
      emailData.attachments?.map((attachment) => ({
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: attachment.name,
        contentType: attachment.contentType,
        contentBytes: attachment.contentBytes,
      })) || [];

    const message = {
      subject: emailData.subject,
      body: {
        contentType: "HTML",
        content: emailData.body,
      },
      toRecipients: emailData.toRecipients.map((email) => ({
        emailAddress: { address: email },
      })),
      ccRecipients:
        emailData.ccRecipients?.map((email) => ({
          emailAddress: { address: email },
        })) || [],
      attachments: formattedAttachments,
    };

    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/sendMail",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Graph API error:", errorData);
      return {
        success: false,
        error: `Failed to send email: ${response.status} ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
