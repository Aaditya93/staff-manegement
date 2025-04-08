import { format } from "date-fns/format";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { EmailMessage } from "./mail-display";
import { Separator } from "../ui/separator";
import { sanitizeEmailContent } from "@/utils/sanitize-email";

interface MailContentProps {
  mail: EmailMessage;
  currentFolder?: string;
}

export function MailContent({ mail, currentFolder }: MailContentProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-start p-4">
        <div className="flex items-start gap-4 text-sm">
          <Avatar>
            <AvatarImage alt={mail.from.emailAddress.name} />
            <AvatarFallback>
              {mail.from.emailAddress.name
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
                : mail.from.emailAddress.address}
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
            <div
              dangerouslySetInnerHTML={{
                __html: mail.body.content
                  ? sanitizeEmailContent(mail.body.content)
                  : "",
              }}
              className="prose max-w-full w-full prose-img:max-w-full prose-img:h-auto email-body-container"
            />
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
