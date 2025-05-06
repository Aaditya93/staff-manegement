import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type Conversation } from "./chat-types";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react"; // Add this import

interface ChatHeaderProps {
  conversation?: Conversation | null;
  isMainHeader: boolean;
  onBack?: () => void;
}

export function ChatHeader({
  conversation,
  isMainHeader,
  onBack,
}: ChatHeaderProps) {
  // Get session data for the current user
  const { data: session } = useSession();

  const getConversationName = (conversation?: Conversation | null) => {
    // If not main header, use current user's name from session
    if (!isMainHeader && session?.user?.name) {
      return session.user.name;
    }
    return conversation?.participants[0]?.name || "Unknown";
  };

  const getConversationImage = (conversation?: Conversation | null) => {
    // If not main header, use current user's image from session
    if (!isMainHeader && session?.user?.image) {
      return session.user.image;
    }
    if (conversation?.participants[0]?.image) {
      return conversation.participants[0].image;
    }
    return "";
  };

  const getStatus = () => {
    // If not main header, assume current user is online
    if (!isMainHeader) {
      return "online";
    }
    // This is a placeholder - you would implement actual status logic here
    // Using optional chaining with status property that might not exist in the type
    return (conversation?.participants[0] as any)?.status || "offline";
  };

  const getLastSeen = () => {
    // Get lastMessage createdAt from conversation or fallback to current time
    const lastMessageTime =
      conversation?.lastMessage?.createdAt || new Date().toString();
    const lastSeenDate = new Date(lastMessageTime);

    // Check if it's today
    const today = new Date();
    const isToday =
      lastSeenDate.getDate() === today.getDate() &&
      lastSeenDate.getMonth() === today.getMonth() &&
      lastSeenDate.getFullYear() === today.getFullYear();

    if (isToday) {
      return `Last seen today at ${lastSeenDate.getHours()}:${lastSeenDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    } else {
      // Format for different dates
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return `Last seen ${lastSeenDate.toLocaleDateString("en-US", options)}`;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 bg-background",
        isMainHeader && "border-b"
      )}
    >
      <div className="flex items-center gap-3">
        {!isMainHeader && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        <Avatar
          className={cn("border", isMainHeader ? "h-10 w-10" : "h-9 w-9")}
        >
          <AvatarImage src={getConversationImage(conversation)} alt="Avatar" />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getConversationName(conversation)[0] || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col justify-center">
          <p className="font-medium text-sm">
            {getConversationName(conversation)}
          </p>

          {(getStatus() === "online" || isMainHeader) && (
            <p className="text-xs text-muted-foreground">
              {getStatus() === "online" ? (
                <>Online</>
              ) : (
                isMainHeader && getLastSeen()
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
