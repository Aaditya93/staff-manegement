import { MessageSquareDashed, MessageSquareDot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EmptyStateProps {
  type: "loading" | "noConversations" | "noMessages" | "welcomeToChat";
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === "loading") {
    return (
      <div className="p-2 flex items-center justify-between w-full">
        <Skeleton className="h-12 w-full">
          <Skeleton className="h-10 w-10 rounded-full" />
        </Skeleton>
      </div>
    );
  }

  if (type === "noConversations") {
    return (
      <div className="p-4 text-center text-muted-foreground flex flex-col items-center gap-2">
        <MessageSquareDashed className="h-8 w-8 opacity-50" />
        <p>No conversations found</p>
      </div>
    );
  }

  if (type === "noMessages") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <MessageSquareDashed className="mx-auto h-12 w-12 mb-2 opacity-50" />
          <p>No messages yet</p>
          <p className="text-sm mt-1">Start a new conversation</p>
        </div>
      </div>
    );
  }

  if (type === "welcomeToChat") {
    return (
      <div className="flex items-center justify-center h-full text-center p-6">
        <div>
          <MessageSquareDot className="mx-auto h-16 w-16 mb-4 opacity-30" />
          <h3 className="text-xl font-medium mb-2">Welcome to Chat</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select a conversation from the list to start messaging or create a
            new one.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
