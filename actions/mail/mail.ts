"use server";

// In mail.ts, add these imports:
import { forceRefreshToken } from "@/actions/auth/token";
import { getValidAccessToken } from "@/actions/auth/token";
import { ExtenedUser } from "@/next-auth";
import { z } from "zod";
import { auth } from "@/auth";
// Schema for email filtering
const EmailFilterSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  skip: z.number().min(0).default(0),
  filterUnread: z.boolean().optional(),
  searchQuery: z.string().optional(),
  folderName: z.string().optional(),
});

type EmailFilter = z.infer<typeof EmailFilterSchema>;

// Interface for email response
interface EmailMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  receivedDateTime: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  isRead: boolean;
  hasAttachments: boolean;
}

/**
 * Fetch emails from standard Outlook folders
 * @param folder The standard folder to fetch emails from (inbox, drafts, sent, junk, trash, archive)
 * @param options Additional options for filtering and pagination
 * @returns Promise with emails, count, and potential error
 */
export async function fetchFolderEmails(
  folder: "inbox" | "drafts" | "sent" | "junk" | "trash" | "archive",
  inboxNumber: number,
  options: {
    limit?: number;
    skip?: number;
    filterUnread?: boolean;
    includeCount?: boolean;
  } = {}
): Promise<{
  emails: EmailMessage[];
  totalCount: number;
  error?: string;
}> {
  try {
    // Set default options
    const {
      limit = 10,
      skip = 0,
      filterUnread = false,
      includeCount = true,
    } = options;

    // Get a valid access token
    const accessToken = await getValidAccessToken(inboxNumber);
    if (!accessToken) {
      return {
        emails: [],
        totalCount: 0,
        error: "Authentication failed. Please sign in again.",
      };
    }

    // Map folder names to Microsoft Graph API folder names
    const folderMapping: Record<string, string> = {
      inbox: "inbox",
      drafts: "drafts",
      sent: "sentitems",
      junk: "junkemail",
      trash: "deleteditems",
      archive: "archive",
    };

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

    // Add query parameters
    const queryParams = [
      `$top=${limit}`,
      `$skip=${skip}`,
      "$select=id,subject,bodyPreview,receivedDateTime,from,isRead,hasAttachments",
      "$orderby=receivedDateTime desc",
    ];

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

/**
 * Sends an email
 */
export async function sendEmail(emailData: {
  subject: string;
  body: string;
  toRecipients: string[];
  ccRecipients?: string[];
  inboxNumber?: number;
  attachments?: Array<{
    name: string;
    contentType: string;
    contentBytes: string; // Base64 encoded content
  }>;
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

/**
 * Marks an email as read or unread
 */
export async function markEmailAsRead(
  emailId: string,
  isRead: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = (await auth()) as ExtenedUser;

    if (!session?.accessToken) {
      return {
        success: false,
        error: "Not authenticated or missing access token",
      };
    }

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages/${emailId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Graph API error:", errorData);
      return {
        success: false,
        error: `Failed to update email: ${response.status} ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Gets a list of mail folders
 */
export async function getMailFolders(): Promise<{
  folders?: Array<{
    id: string;
    displayName: string;
    totalItemCount: number;
    unreadItemCount: number;
  }>;
  error?: string;
}> {
  try {
    const session = (await auth()) as ExtenedUser;
    if (!session?.accessToken) {
      return { error: "Not authenticated or missing access token" };
    }

    const response = await fetch(
      "https://graph.microsoft.com/v1.0/me/mailFolders?$top=50",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Graph API error:", errorData);
      return {
        error: `Failed to fetch folders: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { folders: data.value };
  } catch (error) {
    console.error("Error fetching mail folders:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Folder IDs used by Microsoft Graph API
 */
const SPECIAL_FOLDERS = {
  TRASH: "deleteditems",
  JUNK: "junkemail",
  ARCHIVE: "archive",
};

/**
 * Base function to move an email to a specified folder
 * @param emailId ID of the email to move
 * @param destinationFolderId Destination folder ID
 * @returns Object with success status and optional error message
 */
export async function moveEmailToFolder(
  emailId: string,
  destinationFolderId: string,
  inboxNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get a valid access token
    const accessToken = await getValidAccessToken(inboxNumber);
    if (!accessToken) {
      return {
        success: false,
        error: "Authentication failed. Please sign in again.",
      };
    }

    // Microsoft Graph API endpoint for moving messages
    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${emailId}/move`;

    // Make request to Microsoft Graph API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationId: destinationFolderId,
      }),
    });

    // Handle error responses
    if (!response.ok) {
      // Handle 401 unauthorized errors - token might be expired
      if (response.status === 401) {
        // Try getting a fresh token
        const newToken = await getValidAccessToken(inboxNumber);
        if (!newToken) {
          return {
            success: false,
            error: "Authentication failed after token refresh.",
          };
        }

        // Retry the request with fresh token
        const retryResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            destinationId: destinationFolderId,
          }),
        });

        if (retryResponse.ok) {
          return { success: true };
        }
      }

      // Process error response
      let errorMessage = `Failed to move email: ${response.status} ${response.statusText}`;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = `Graph API error: ${errorData.error.message}`;
          }
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Success
    return { success: true };
  } catch (error) {
    console.error("Error moving email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Move an email to the trash folder
 * @param emailId ID of the email to move to trash
 * @returns Object with success status and optional error message
 */
export async function moveToTrash(
  emailId: string,
  inboxNumber: number
): Promise<{ success: boolean; error?: string }> {
  return moveEmailToFolder(emailId, SPECIAL_FOLDERS.TRASH, inboxNumber);
}

/**
 * Move an email to the junk folder
 * @param emailId ID of the email to move to junk
 * @returns Object with success status and optional error message
 */
export async function moveToJunk(
  emailId: string,
  inboxNumber: number
): Promise<{ success: boolean; error?: string }> {
  return moveEmailToFolder(emailId, SPECIAL_FOLDERS.JUNK, inboxNumber);
}

/**
 * Move an email to the archive folder
 * @param emailId ID of the email to archive
 * @returns Object with success status and optional error message
 */
export async function moveToArchive(
  emailId: string,
  inboxNumber: number
): Promise<{ success: boolean; error?: string }> {
  return moveEmailToFolder(emailId, SPECIAL_FOLDERS.ARCHIVE, inboxNumber);
}

/**
 * Marks an email as unread
 * @param emailId ID of the email to mark as unread
 * @returns Object with success status and optional error message
 */
export async function markAsUnread(
  emailId: string,
  inboxNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get a valid access token
    const accessToken = await getValidAccessToken(inboxNumber);
    if (!accessToken) {
      return {
        success: false,
        error: "Authentication failed. Please sign in again.",
      };
    }

    // Microsoft Graph API endpoint for updating message properties
    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${emailId}`;

    // Make request to Microsoft Graph API
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isRead: false,
      }),
    });

    // Handle error responses
    if (!response.ok) {
      // Handle 401 unauthorized errors - token might be expired
      if (response.status === 401) {
        // Try getting a fresh token
        const newToken = await getValidAccessToken();
        if (!newToken) {
          return {
            success: false,
            error: "Authentication failed after token refresh.",
          };
        }

        // Retry the request with fresh token
        const retryResponse = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isRead: false,
          }),
        });

        if (retryResponse.ok) {
          return { success: true };
        }
      }

      // Process error response
      let errorMessage = `Failed to mark email as unread: ${response.status} ${response.statusText}`;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = `Graph API error: ${errorData.error.message}`;
          }
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Success
    return { success: true };
  } catch (error) {
    console.error("Error marking email as unread:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Toggles the flag (star) status of an email
 * @param emailId ID of the email to flag/unflag
 * @param flag Whether to flag (true) or unflag (false) the email
 * @returns Object with success status and optional error message
 */
export async function toggleEmailFlag(
  emailId: string,
  flag: boolean = true,
  inboxNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get a valid access token
    const accessToken = await getValidAccessToken(inboxNumber);
    if (!accessToken) {
      return {
        success: false,
        error: "Authentication failed. Please sign in again.",
      };
    }

    // Microsoft Graph API endpoint for updating message properties
    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${emailId}`;

    // Create the appropriate flag status
    const flagStatus = flag ? "flagged" : "notFlagged";

    // Make request to Microsoft Graph API
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flag: {
          flagStatus,
        },
      }),
    });

    // Handle error responses
    if (!response.ok) {
      // Handle 401 unauthorized errors - token might be expired
      if (response.status === 401) {
        // Try getting a fresh token
        const newToken = await getValidAccessToken();
        if (!newToken) {
          return {
            success: false,
            error: "Authentication failed after token refresh.",
          };
        }

        // Retry the request with fresh token
        const retryResponse = await fetch(endpoint, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flag: {
              flagStatus,
            },
          }),
        });

        if (retryResponse.ok) {
          return { success: true };
        }
      }

      // Process error response
      const action = flag ? "flag" : "unflag";
      let errorMessage = `Failed to ${action} email: ${response.status} ${response.statusText}`;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = `Graph API error: ${errorData.error.message}`;
          }
        }
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Success
    return { success: true };
  } catch (error) {
    console.error("Error toggling email flag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
