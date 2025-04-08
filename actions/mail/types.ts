import { z } from "zod";
import { EmailFilterSchema } from "./schema";

export type EmailFilter = z.infer<typeof EmailFilterSchema>;

// Interface for email response
export interface EmailMessage {
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

export interface EmailAttachment {
  name: string;
  contentType: string;
  contentBytes: string; // Base64 encoded content
}
