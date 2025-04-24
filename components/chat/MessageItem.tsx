import { Check, CheckCheck } from "lucide-react";
import { type Message } from "./chat-types";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  formatTime: (iso: string) => string;
  isFirstMessage?: boolean;
}

export function MessageItem({
  message,
  isCurrentUser,
  formatTime,
  isFirstMessage = false,
}: MessageItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const loadMoreMessages = async () => {
    const currentLimit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 100;
    const newLimit = currentLimit + 100;

    // Create new URL with updated limit
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());

    // Update the URL and trigger navigation
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    // Optional: Add a small delay before refresh to ensure URL is updated first
    setTimeout(() => {
      router.refresh();
    }, 50);
  };

  return (
    <>
      {isFirstMessage && (
        <div className="flex justify-center my-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMoreMessages}
            className="text-xs text-muted-foreground hover:bg-muted"
          >
            Load More Messages
          </Button>
        </div>
      )}
      <div
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm border shadow-sm 
            ${
              isCurrentUser
                ? "bg-primary text-primary-foreground rounded-br-none"
                : "bg-secondary text-secondary-foreground rounded-bl-none"
            } 
            ${
              message._id.startsWith("temp-")
                ? "animate-slide-in-up opacity-90"
                : "animate-fade-in"
            }
            ${message.status === "sending" ? "opacity-80" : ""}
            ${message.status === "failed" ? "border-red-500" : ""}
          `}
          style={{
            animationDuration: "0.3s",
            animationFillMode: "forwards",
          }}
        >
          <div className="break-words">{message.content[0]}</div>
          <div
            className={`text-xs mt-1 flex items-center justify-end gap-1 
              ${
                isCurrentUser
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
          >
            <span>{formatTime(message.createdAt)}</span>

            {isCurrentUser && (
              <span className="flex items-center ml-1">
                {message.status === "sending" ? (
                  <span className="h-3 w-3 relative">
                    <span className="absolute animate-ping h-2 w-2 rounded-full bg-blue-300 opacity-75"></span>
                    <span className="absolute h-3 w-3 rounded-full bg-blue-400"></span>
                  </span>
                ) : message.status === "failed" ? (
                  <span className="text-red-500 text-xs">⚠️</span>
                ) : message.seenBy && message.seenBy.length > 0 ? (
                  <CheckCheck className="h-3 w-3 text-blue-400" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
