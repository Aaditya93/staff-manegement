import { format } from "date-fns/format";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { EmailMessage } from "./mail-display";
import { Separator } from "../ui/separator";
import { sanitizeEmailContent } from "@/utils/sanitize-email";
import { useRef, useEffect } from "react";

interface MailContentProps {
  mail: EmailMessage;
  currentFolder?: string;
}

export function MailContent({ mail, currentFolder }: MailContentProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle iframe content loading
  useEffect(() => {
    if (mail.body.contentType === "html" && iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // Write sanitized content to iframe
        iframeDoc.open();
        iframeDoc.write(
          mail.body.content ? sanitizeEmailContent(mail.body.content) : ""
        );
        iframeDoc.close();

        // Adjust iframe height to content height after content loads
        const resizeIframe = () => {
          if (iframe && iframeDoc && iframeDoc.body) {
            iframe.style.height = `${iframeDoc.body.scrollHeight}px`;
          }
        };

        // Set initial height and add listener for content changes
        iframe.onload = resizeIframe;
        setTimeout(resizeIframe, 100);

        // MutationObserver to handle dynamic content changes
        const observer = new MutationObserver(resizeIframe);
        if (iframeDoc.body) {
          observer.observe(iframeDoc.body, {
            childList: true,
            subtree: true,
            attributes: true,
          });
        }

        return () => observer.disconnect();
      }
    }
  }, [mail.body]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-start p-4">
        <div className="flex items-start gap-4 text-sm">
          <Avatar>
            <AvatarImage alt={mail.from?.emailAddress.name} />
            <AvatarFallback>
              {mail.from?.emailAddress.name
                .split(" ")
                .map((chunk) => chunk[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <div className="font-semibold">
              {currentFolder === "sent"
                ? mail.toRecipients?.[0]?.emailAddress.name || "Recipient"
                : mail.from.emailAddress.name}
            </div>
            <div className="line-clamp-1 text-xs">{mail.subject}</div>
            <div className="line-clamp-1 text-xs">
              <span className="font-medium">
                {currentFolder === "sent" ? "To" : "From"}
              </span>{" "}
              {currentFolder === "sent"
                ? mail.toRecipients?.[0]?.emailAddress.address || "No recipient"
                : mail.from?.emailAddress.address}
            </div>
          </div>
        </div>
        {(mail.receivedDateTime || mail.sentDateTime) && (
          <div className="ml-auto text-xs text-muted-foreground">
            {format(
              new Date(
                currentFolder === "sent"
                  ? mail.sentDateTime
                  : mail.receivedDateTime
              ),
              "PPpp"
            )}
          </div>
        )}
      </div>
      <Separator />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1 p-4 text-sm">
          {mail.body.contentType === "html" ? (
            <div className="email-iframe-container mx-auto max-w-full">
              <iframe
                ref={iframeRef}
                title="Email content"
                className="w-full border-none"
                scrolling="no"
                sandbox="allow-same-origin allow-popups"
              />
            </div>
          ) : (
            <div className="whitespace-pre-wrap w-full">
              {mail.body.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
