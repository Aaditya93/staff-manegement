import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { type Conversation } from "./chat-types";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  const getConversationName = (conversation?: Conversation | null) => {
    if (!conversation) return "Chat";
    if (conversation.name) return conversation.name;
    return conversation.participants[0]?.name || "Unknown";
  };

  const getConversationImage = (conversation?: Conversation | null) => {
    if (!conversation) return "";
    if (!conversation.isGroup && conversation.participants[0]?.image) {
      return conversation.participants[0].image;
    }
    return "";
  };

  const getStatus = () => {
    // This is a placeholder - you would implement actual status logic here
    // Using optional chaining with status property that might not exist in the type
    return (conversation?.participants[0] as any)?.status || "offline";
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
                <>
                  <Badge
                    variant="outline"
                    className="h-2 w-2 rounded-full bg-green-500 border-0 mr-1"
                  />
                  Online
                </>
              ) : (
                isMainHeader && "Last seen today at 12:30"
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
