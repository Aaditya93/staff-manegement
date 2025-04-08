"use server";

import { auth } from "@/auth";
import { ExtenedUser } from "@/next-auth";
import { makeGraphRequest } from "./helpers";

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
    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${emailId}/move`;
    const options = {
      method: "POST",
      body: JSON.stringify({
        destinationId: destinationFolderId,
      }),
    };

    try {
      const response = await makeGraphRequest(endpoint, options, inboxNumber);

      if (!response.ok) {
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

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
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
    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${emailId}`;
    const options = {
      method: "PATCH",
      body: JSON.stringify({
        isRead: false,
      }),
    };

    try {
      const response = await makeGraphRequest(endpoint, options, inboxNumber);

      if (!response.ok) {
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

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error("Error marking email as unread:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Marks an email as read
 * @param emailId ID of the email to mark as read
 * @returns Object with success status and optional error message
 */
export async function markAsRead(
  emailId: string,
  inboxNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${emailId}`;
    const options = {
      method: "PATCH",
      body: JSON.stringify({
        isRead: true,
      }),
    };

    try {
      const response = await makeGraphRequest(endpoint, options, inboxNumber);

      if (!response.ok) {
        // Process error response
        let errorMessage = `Failed to mark email as read: ${response.status} ${response.statusText}`;

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

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error("Error marking email as read:", error);
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
    // Create the appropriate flag status
    const flagStatus = flag ? "flagged" : "notFlagged";

    const endpoint = `https://graph.microsoft.com/v1.0/me/messages/${emailId}`;
    const options = {
      method: "PATCH",
      body: JSON.stringify({
        flag: {
          flagStatus,
        },
      }),
    };

    try {
      const response = await makeGraphRequest(endpoint, options, inboxNumber);

      if (!response.ok) {
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

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error("Error toggling email flag:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Marks an email as read or unread (legacy version using auth)
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
