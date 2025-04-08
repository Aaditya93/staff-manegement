import { getValidAccessToken } from "../auth/token";

/**
 * Base function to move an email to a specified folder
 * @param emailId ID of the email to move
 * @param destinationFolderId Destination folder ID
 * @returns Object with success status and optional error message
 */

const SPECIAL_FOLDERS = {
  TRASH: "deleteditems",
  JUNK: "junkemail",
  ARCHIVE: "archive",
};

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
        const newToken = await getValidAccessToken(inboxNumber);
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
