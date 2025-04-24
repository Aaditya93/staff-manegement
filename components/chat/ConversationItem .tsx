import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Conversation } from "./chat-types";
import { useRouter } from "next/navigation";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  formatTime: (iso: string) => string;
  isLastItem: boolean;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  formatTime,
  isLastItem,
}: ConversationItemProps) {
  const router = useRouter();

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    return conversation.participants[0]?.name || "Unknown";
  };

  const getConversationImage = (conversation: Conversation) => {
    if (!conversation.isGroup && conversation.participants[0]?.image) {
      return conversation.participants[0].image;
    }
    return "";
  };

  const handleClick = () => {
    // Update the URL with the conversation ID
    router.push(`/chat/${conversation._id || "none"}`);
    // Call the original onSelect function
    onSelect();
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`p-3 w-full hover:bg-muted cursor-pointer text-left flex items-center justify-between ${
          isActive ? "bg-muted/50" : ""
        }`}
      >
        <div className="flex gap-3 items-center">
          <Avatar className="border">
            <AvatarImage src={getConversationImage(conversation)} />
            <AvatarFallback>
              {getConversationName(conversation)[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex justify-between w-full">
              <p className="text-sm font-medium leading-none">
                {getConversationName(conversation)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {conversation.lastMessage?.content[0] || "No messages yet"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">
            {conversation.lastMessage
              ? formatTime(conversation.lastMessage.createdAt)
              : formatTime(conversation.updatedAt)}
          </span>
          {conversation.unreadCount > 0 && (
            <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white border">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </button>
      {!isLastItem && <Separator className="mx-12" />}
    </div>
  );
}
