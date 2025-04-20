import { ChatDashboard } from "@/components/chat/chat-dashboard";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchConversationById } from "@/actions/chat/conversation";

import { fetchConversationMessages } from "@/actions/chat/conversation";
import { notFound } from "next/navigation";

// Define message limit options
const MESSAGE_LIMITS = {
  default: 150, // Default message count
  medium: 300, // Medium load
  large: 600, // Large load
  max: 900, // Maximum messages to load initially
};

export default async function MessagingPage({
  params,
  searchParams,
}: {
  params: { conversationId: string };
  searchParams?: { limit?: string };
}) {
  // Get conversationId from URL parameters
  const { conversationId } = params;

  // Get message limit from query params (e.g. /chat/123?limit=300)
  const requestedLimit = searchParams?.limit
    ? parseInt(searchParams.limit)
    : MESSAGE_LIMITS.default;

  // Ensure limit is valid (use default if invalid)
  const messageLimit = Object.values(MESSAGE_LIMITS).includes(requestedLimit)
    ? requestedLimit
    : MESSAGE_LIMITS.default;

  // Fetch conversation data
  const conversationData = await fetchConversationById(conversationId);

  // If conversation not found, show 404
  if (!conversationData || conversationData.error) {
    return notFound();
  }

  // Fetch messages for the conversation with the specified limit
  const { messages, error } = await fetchConversationMessages(
    conversationId,
    messageLimit
  );

  if (error) {
    console.error("Error loading messages:", error);
  }
  console.log("Fetched messages:", messages);
  console.log("conversationData:", conversationData);

  // Map fetched messages to add the required 'type' property
  const formattedMessages =
    messages?.map((message) => ({
      ...message,
      type: "text", // Default type, adjust as needed based on your application's message types
    })) || [];
  console.log("Formatted messages:", formattedMessages);

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <ChatDashboard
          initialConversationId={conversationId}
          initialMessages={formattedMessages}
          initialConversation={conversationData.conversation}
          messageLimit={messageLimit}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export const dynamic = "force-dynamic";
