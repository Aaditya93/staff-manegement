import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

import { cn } from "@/lib/utils";

import { ScrollArea } from "../ui/scroll-area";
import { useMail } from "./use-mails";
import { EmailMessage } from "./mail-display";
import { markAsRead } from "@/actions/mail/email-actions";
import PaginationComponent from "./pagination";

interface MailListProps {
  items: EmailMessage[];
  emptyState?: React.ReactNode;
  folder?: string;
  status?: string;
  inboxNumber?: number;
  range?: string;
}

export function MailList({
  items,
  emptyState,
  folder,
  status,
  inboxNumber,
  range,
}: MailListProps) {
  const [mail, setMail] = useMail();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Calculate pagination values
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  // Set up scroll event listener

  if (items.length === 0) {
    return (
      emptyState || (
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No emails found</p>
        </div>
      )
    );
  }

  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    const withoutScripts = html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      " "
    );
    const withoutStyles = withoutScripts.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      " "
    );
    const plainText = withoutStyles
      .replace(/<\/[^>]+>/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    return plainText;
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="h-[calc(100vh-10rem)]" viewportRef={scrollAreaRef}>
        <div className="flex flex-col gap-2 p-4 pt-0">
          {currentItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                mail.selected === item.id && "bg-muted"
              )}
              onClick={async () => {
                // Set selected mail in state
                setMail({
                  ...mail,
                  selected: item.id,
                });

                // If the email is unread, mark it as read
                if (!item.isRead) {
                  await markAsRead(item.id, inboxNumber || 0);
                }
              }}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">
                      {item.from?.emailAddress.name || "User"}
                    </div>
                    {!item.isRead && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      mail.selected === item.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatDistanceToNow(new Date(item.receivedDateTime), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <div className="text-xs font-medium">{item.subject}</div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.body.contentType === "html"
                  ? stripHtmlTags(item.body.content).substring(0, 300)
                  : item.body.content.substring(0, 300)}
              </div>
            </button>
          ))}
        </div>
        {/* Pagination component shown after all emails */}
        <PaginationComponent />
      </ScrollArea>
    </div>
  );
}
