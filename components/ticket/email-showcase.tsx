"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { format, parseISO } from "date-fns";
import { Mail, Loader2, AlertCircle, Calendar, Clock } from "lucide-react";
import { getEmail } from "@/actions/tickets/get-email";

// Updated interface to match Microsoft Graph API response
interface GraphEmailData {
  id: string;
  subject: string;
  webLink: string;
  bodyPreview: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  sentDateTime: string;
  receivedDateTime: string;
  importance: string;
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  toRecipients: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  ccRecipients: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  hasAttachments: boolean;
  isDraft: boolean;
  isRead: boolean;
}

interface EmailResponse {
  email: GraphEmailData;
  emailSummary?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  approvedBy?: {
    id: string;
    name: string;
    emailId: string;
  };
}

interface EmailShowcaseProps {
  email: string;
  emailId: string;
  userId: string;
  onEmailFetched?: (emailData: EmailResponse) => void;
}

const sanitizeEmailContent = (htmlContent: string): string => {
  if (!htmlContent) return "";

  // Basic sanitization using a more robust library like DOMPurify is recommended for production
  let sanitized = htmlContent
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/on\w+="[^"]*"/g, "") // Remove inline event handlers (double quotes)
    .replace(/on\w+='[^']*'/g, ""); // Remove inline event handlers (single quotes)

  // Attempt to fix common image issues
  sanitized = sanitized
    // Ensure base64 images have a MIME type (default to png if missing, though imperfect)
    .replace(/src="data:;base64,/gi, 'src="data:image/png;base64,')
    // Try to make images responsive, but be less aggressive than replacing width/height entirely
    .replace(/<img([^>]*)>/gi, (match, attributes) => {
      const style = attributes.match(/style="([^"]*)"/i);
      let styleAttr = style ? style[1] : "";
      // Add max-width if not present
      if (!styleAttr.includes("max-width")) {
        styleAttr += ";max-width: 100%;";
      }
      // Ensure height is auto if max-width is set
      if (styleAttr.includes("max-width") && !styleAttr.includes("height")) {
        styleAttr += ";height: auto;";
      }
      // Remove existing style attribute if present
      attributes = attributes.replace(/style="[^"]*"/i, "");
      // Add the modified style attribute
      return `<img${attributes} style="${styleAttr.replace(/^;+|;+$/g, "")}" />`;
    });

  // Note: Rendering cid: images requires fetching attachments and replacing
  // src="cid:..." with data URLs. This function doesn't handle that.
  // Note: Rendering x-gmail-data images is generally not possible outside Gmail.

  return sanitized;
};
const EmailShowcase: React.FC<EmailShowcaseProps> = ({
  email,
  emailId,
  userId,
  onEmailFetched,
}) => {
  console.log("fetchEmailData called with:", { email, emailId, userId });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState<EmailResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log("EmailShowcase mounted with:", { emailId, userId });
  }, [emailId, userId]);

  const fetchEmailData = async () => {
    console.log("fetchEmailData called with:", { emailId, userId });

    setErrorMessage(null);

    if (!emailId || !userId) {
      const error = "Missing required parameters: emailId or userId";
      console.error(error, { emailId, userId });
      setErrorMessage(error);
      return;
    }

    if (isLoading) {
      console.log("Already loading, skipping fetch");
      return;
    }

    setIsLoading(true);

    try {
      console.log("fetchEmailData called with:", { email, emailId, userId });

      // Wrap in a timeout to prevent potential race conditions
      const fetchedEmail = (await Promise.race([
        await getEmail(email, emailId, userId), // Ensure these match the action's parameter order
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Request timed out")), 10000)
        ),
      ])) as EmailResponse | null;

      console.log("Email data returned:", fetchedEmail);

      if (!fetchedEmail) {
        throw new Error("No email data returned");
      }

      setEmailDetails(fetchedEmail);

      if (onEmailFetched) {
        onEmailFetched(fetchedEmail);
      }
    } catch (error) {
      console.error("Failed to fetch email details:", error);

      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && (!emailDetails || errorMessage)) {
      fetchEmailData();
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    fetchEmailData();
  };

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => handleOpenChange(true)}
      >
        <Mail className="h-4 w-4" />
        View Email Details
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]" position="center">
          <DialogHeader>
            <DialogTitle>Email Information</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2">Loading email details...</span>
              </div>
            ) : errorMessage ? (
              <div className="flex flex-col items-center justify-center py-8 text-red-500">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p className="text-center mb-4">{errorMessage}</p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Try Again
                </Button>
              </div>
            ) : // ...existing code...
            emailDetails ? (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {emailDetails.email.subject}
                  </p>
                  {/* <p className="text-sm text-muted-foreground mt-1">
                    {emailDetails.email.bodyPreview}
                  </p> */}
                </div>

                <Separator />

                {/* Email body content */}
                <div className="overflow-y-auto max-h-64 flex-1 p-4 text-sm border rounded-md">
                  {emailDetails.email.body?.contentType === "html" ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: emailDetails.email.body.content
                          ? sanitizeEmailContent(
                              // Use the updated function
                              emailDetails.email.body.content
                            )
                          : "",
                      }}
                      // Consider adding more specific prose classes if needed
                      className="prose prose-sm max-w-full w-full prose-img:max-w-full prose-img:h-auto prose-a:text-blue-600 prose-a:break-all email-body-container"
                      style={{
                        wordBreak: "break-word", // Ensure long words/links wrap
                        overflowWrap: "break-word", // Alternate property for wrapping
                        lineHeight: 1.6, // Adjust line spacing if needed
                      }}
                    />
                  ) : (
                    <div className="whitespace-pre-wrap w-full">
                      {emailDetails.email.body?.content ||
                        "No content available"}
                    </div>
                  )}
                </div>

                <Separator />

                {emailDetails.emailSummary && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Summary</p>
                      <p className="text-sm">{emailDetails.emailSummary}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* ...rest of existing code... */}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      emailDetails.email.isRead ? "secondary" : "default"
                    }
                  >
                    {emailDetails.email.isRead ? "Read" : "Unread"}
                  </Badge>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">From:</span>
                  <div className="text-sm">
                    <div>{emailDetails.email.from.emailAddress.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {emailDetails.email.from.emailAddress.address}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">To:</span>
                  <div className="text-sm">
                    {emailDetails.email.toRecipients.map((recipient, index) => (
                      <div key={index} className="mb-1">
                        <div>{recipient.emailAddress.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {recipient.emailAddress.address}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Show either Sent or Received timestamp based on email type */}
                {emailDetails.email.isDraft ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Created: {formatDate(emailDetails.email.createdDateTime)}
                    </span>
                  </div>
                ) : emailDetails.email.from.emailAddress.address ===
                  emailDetails.email.toRecipients[0]?.emailAddress.address ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Sent: {formatDate(emailDetails.email.sentDateTime)}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Received:{" "}
                      {formatDate(emailDetails.email.receivedDateTime)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No email details available. Please try again.
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="mt-4 mx-auto block"
                >
                  Load Email Data
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailShowcase;
