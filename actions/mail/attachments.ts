"use server";

import { makeGraphRequest } from "./helpers";

/**
 * Download an email attachment
 * @param messageId ID of the email
 * @param attachmentId ID of the attachment
 * @param inboxNumber Inbox number to get the valid token
 * @returns Object with attachment content and metadata, or error
 */
export async function downloadAttachment(
  messageId: string,
  attachmentId: string,
  inboxNumber: number
): Promise<{
  content?: string; // Base64 encoded content
  contentType?: string;
  name?: string;
  error?: string;
}> {
  try {
    // Microsoft Graph API endpoint for downloading attachment
    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${messageId}/attachments/${attachmentId}`;
    const options = { method: "GET" };

    try {
      const response = await makeGraphRequest(endpoint, options, inboxNumber);

      if (!response.ok) {
        // Process error response
        const errorMessage = `Failed to download attachment: ${response.status} ${response.statusText}`;
        return { error: errorMessage };
      }

      // Process successful response
      const data = await response.json();
      return {
        content: data.contentBytes, // Base64 encoded content
        contentType: data.contentType,
        name: data.name,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error("Error downloading attachment:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
