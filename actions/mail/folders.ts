"use server";

import { auth } from "@/auth";
import { ExtenedUser } from "@/next-auth";

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
