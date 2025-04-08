import { ComponentProps } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { useMail } from "./use-mails";
import { EmailMessage } from "./mail-display";
interface MailListProps {
  items: EmailMessage[];
  emptyState?: React.ReactNode;
}

export function MailList({ items, emptyState }: MailListProps) {
  const [mail, setMail] = useMail();

  if (items.length === 0) {
    return (
      emptyState || (
        <div className="flex h-[450px] items-center justify-center">
          <p className="text-sm text-muted-foreground">No emails found</p>
        </div>
      )
    );
  }
  const stripHtmlTags = (html: string): string => {
    if (!html) return "";
    // First remove script and style tags completely
    const withoutScripts = html.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      " "
    );
    const withoutStyles = withoutScripts.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      " "
    );
    // Then strip remaining HTML tags
    const plainText = withoutStyles
      .replace(/<\/[^>]+>/g, " ") // Replace closing tags with space
      .replace(/<[^>]+>/g, " ") // Replace opening tags with space
      .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
      .replace(/&gt;/g, ">") // Replace greater than entity
      .replace(/&lt;/g, "<") // Replace less than entity
      .replace(/&amp;/g, "&") // Replace ampersand entity
      .replace(/&quot;/g, '"') // Replace quote entity
      .replace(/&#39;/g, "'") // Replace apostrophe entity
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim(); // Trim extra spaces

    return plainText;
  };

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              mail.selected === item.id && "bg-muted"
            )}
            onClick={() =>
              setMail({
                ...mail,
                selected: item.id,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">
                    {item.from.emailAddress.name}
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
            {/* {item..length ? (
              <div className="flex items-center gap-2">
                {item.labels.map((label) => (
                  <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                    {label}
                  </Badge>
                ))}
              </div>
            ) : null} */}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
