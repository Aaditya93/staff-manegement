"use server";

import { getValidAccessToken } from "@/actions/auth/token";

/**
 * Map standard folder names to Microsoft Graph API folder names
 */

/**
 * Helper to make authenticated Graph API requests with token refresh
 */
export async function makeGraphRequest(
  endpoint: string,
  options: RequestInit,
  inboxNumber: number
): Promise<Response> {
  // Get a valid access token
  const accessToken = await getValidAccessToken(inboxNumber);
  if (!accessToken) {
    throw new Error("Authentication failed. Please sign in again.");
  }

  // Add authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // Make the request
  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If unauthorized, try to refresh token and retry once
  if (response.status === 401) {
    // Try getting a fresh token
    const newToken = await getValidAccessToken(inboxNumber);
    if (!newToken) {
      throw new Error("Authentication failed after token refresh.");
    }

    // Retry with fresh token
    return fetch(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  return response;
}
