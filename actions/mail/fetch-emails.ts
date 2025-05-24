"use server";

import { auth } from "@/auth";
import { ExtenedUser } from "@/next-auth";
import { forceRefreshToken, getValidAccessToken } from "@/actions/auth/token";
import { EmailMessage } from "./types";

const folderMapping: Record<string, string> = {
  inbox: "inbox",
  drafts: "drafts",
  sent: "sentitems",
  junk: "junkemail",
  trash: "deleteditems",
  archive: "archive",
};
/**
 * Fetch emails from standard Outlook folders
 * @param folder The standard folder to fetch emails from (inbox, drafts, sent, junk, trash, archive)
 * @param inboxNumber Inbox number to get the valid token
 * @param options Additional options for filtering and pagination
 * @returns Promise with emails, count, and potential error
 */
export async function fetchFolderEmails(
  folder: "inbox" | "drafts" | "sent" | "junk" | "trash" | "archive",
  inboxNumber: number,
  options: {
    page?: number;
    pageSize?: number;
    filterUnread?: boolean;
    includeCount?: boolean;
    range?: string;
  } = {}
): Promise<{
  emails: EmailMessage[];
  totalCount: number;
  error?: string;
}> {
  try {
    // Set default options
    const {
      page = 1,
      pageSize = 10,
      filterUnread = false,
      includeCount = true,
      range,
    } = options;

    // Calculate skip and top values based on either range or page/pageSize
    let skip = (page - 1) * pageSize;
    let top = pageSize;

    // If range is provided, use it to calculate pagination
    if (range) {
      const rangeValue = parseInt(range);
      if (!isNaN(rangeValue)) {
        // For any range value, get the previous batch size
        // e.g., range 20 → skip 0, range 40 → skip 20, range 60 → skip 40
        const batchSize = 20; // Fixed batch size
        skip = Math.max(0, rangeValue - batchSize);
        top = batchSize;
      }
    }

    // Get a valid access token
    const accessToken = await getValidAccessToken(inboxNumber);
    if (!accessToken) {
      return {
        emails: [],
        totalCount: 0,
        error: "Authentication failed. Please sign in again.",
      };
    }

    const graphFolderName = folderMapping[folder];
    if (!graphFolderName) {
      return {
        emails: [],
        totalCount: 0,
        error: "Invalid folder specified",
      };
    }

    // Build the Graph API query
    let graphUrl = `https://graph.microsoft.com/v1.0/me/mailFolders/${graphFolderName}/messages`;

    // Add query parameters with the calculated skip and top values
    const queryParams = [
      `$top=${top}`,
      `$skip=${skip}`,
      "$select=id,subject,body,receivedDateTime,sentDateTime,from,sender,isRead,hasAttachments,toRecipients,ccRecipients,bccRecipients",
      "$expand=attachments($select=id,name,contentType,size,isInline)",
      "$orderby=receivedDateTime desc",
    ];

    // Rest of your existing code remains the same...

    // Add filter for unread messages if requested
    if (filterUnread) {
      queryParams.push("$filter=isRead eq false");
    }

    // Include count if needed
    if (includeCount) {
      queryParams.push("$count=true");
    }

    // Combine URL and parameters
    graphUrl += `?${queryParams.join("&")}`;

    // Make request to Microsoft Graph API
    const response = await fetch(graphUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(includeCount ? { ConsistencyLevel: "eventual" } : {}),
      },
    });

    // Handle error responses
    if (!response.ok) {
      // Handle 401 errors by trying to refresh the token
      if (response.status === 401) {
        console.log("401 Unauthorized - forcing token refresh");
        forceRefreshToken();

        // Try one more time with a fresh token
        const newToken = await getValidAccessToken(inboxNumber);
        if (newToken) {
          const retryResponse = await fetch(graphUrl, {
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
              ...(includeCount ? { ConsistencyLevel: "eventual" } : {}),
            },
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            return {
              emails: data.value,
              totalCount: data["@odata.count"] || data.value.length,
            };
          }
        }
      }

      // Process error response
      let errorMessage = `Failed to fetch emails: ${response.status} ${response.statusText}`;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const text = await response.text();
          if (text && text.trim()) {
            const errorData = JSON.parse(text);
            if (errorData.error?.message) {
              errorMessage = `Graph API error: ${errorData.error.message}`;
            }
          }
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      return {
        emails: [],
        totalCount: 0,
        error: errorMessage,
      };
    }

    // Process successful response
    const data = await response.json();

    return {
      emails: data.value,
      totalCount: data["@odata.count"] || data.value.length,
    };
  } catch (error) {
    console.error("Error fetching emails:", error);

    return {
      emails: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetches a single email by ID
 */
export async function fetchEmailById(emailId: string): Promise<{
  email?: string;
  error?: string;
}> {
  try {
    const session = (await auth()) as ExtenedUser;

    if (!session?.accessToken) {
      return { error: "Not authenticated or missing access token" };
    }

    const graphUrl = `https://graph.microsoft.com/v1.0/me/messages/${emailId}`;

    const response = await fetch(graphUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Graph API error:", errorData);
      return {
        error: `Failed to fetch email: ${response.status} ${response.statusText}`,
      };
    }

    const email = await response.json();
    return { email };
  } catch (error) {
    console.error("Error fetching email:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function fetchUserEmailById(
  emailId: string,
  accessToken: string
): Promise<{
  email?: string;
  error?: string;
}> {
  try {
    const graphUrl = `https://graph.microsoft.com/v1.0/me/messages/${emailId}`;

    const response = await fetch(graphUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Graph API error:", errorData);
      return {
        error: `Failed to fetch email: ${response.status} ${response.statusText}`,
      };
    }

    const email = await response.json();
    return { email };
  } catch (error) {
    console.error("Error fetching email:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
