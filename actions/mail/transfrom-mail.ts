import { v4 as uuidv4 } from "uuid";
import { Mail as MailComponent } from "@/components/mail/mail";

/**
 * Interface for application mail format
 */
interface Mail {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  date: string;
  read: boolean;
  labels: string[];
}

/**
 * Interface for Microsoft Graph API email format
 */
interface GraphEmail {
  "@odata.etag": string;
  id: string;
  receivedDateTime: string;
  hasAttachments: boolean;
  subject: string;
  bodyPreview: string;
  isRead: boolean;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
}

interface GraphEmailResponse {
  emails: GraphEmail[];
  totalCount: number;
}

/**
 * Converts Microsoft Graph API emails to the application's mail format
 */
export function convertGraphEmailsToMailFormat(
  graphResponse: GraphEmailResponse
): Mail[] {
  if (
    !graphResponse ||
    !graphResponse.emails ||
    !Array.isArray(graphResponse.emails)
  ) {
    return [];
  }

  return graphResponse.emails.map((email) => {
    // Extract sender name and email from the from object
    const name = email.from?.emailAddress?.name || "Unknown Sender";
    const emailAddress =
      email.from?.emailAddress?.address || "no-email@example.com";

    // Generate appropriate labels based on email content or subject
    const labels = generateLabelsFromEmail(email);

    return {
      id: email.id || uuidv4(), // Use existing ID or generate a new one
      name,
      email: emailAddress,
      subject: email.subject || "(No Subject)",
      text: email.bodyPreview || "",
      date: email.receivedDateTime,
      read: email.isRead,
      labels,
    };
  });
}

/**
 * Helper function to generate labels based on email content
 */
function generateLabelsFromEmail(email: GraphEmail): string[] {
  const labels: string[] = [];
  const subject = email.subject?.toLowerCase() || "";
  const body = email.bodyPreview?.toLowerCase() || "";

  // Example rules for label generation
  if (subject.includes("meeting") || body.includes("meeting")) {
    labels.push("meeting");
  }

  if (subject.includes("azure") || body.includes("azure")) {
    labels.push("work");
  }

  if (subject.includes("account") || body.includes("account")) {
    labels.push("important");
  }

  // If no labels were assigned, add a default label
  if (labels.length === 0) {
    labels.push("inbox");
  }

  return labels;
}

/**
 * Example usage:
 *
 * import { convertGraphEmailsToMailFormat } from './utils/emailConverter';
 *
 * // Fetch emails from Microsoft Graph API
 * const graphEmails = await fetchEmailsFromGraph();
 *
 * // Convert to application format
 * const appEmails = convertGraphEmailsToMailFormat(graphEmails);
 */
