import { ChatDashboard } from "@/components/travel-agent/chat/chat-dashboard";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  fetchConversationMessages,
  fetchUserConversations,
} from "@/actions/chat/conversation";
import AppSidebar from "@/components/travel-agent/app-sidebar";

// Define message limit options
const MESSAGE_LIMITS = {
  default: 100, // Default message count
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
  // Await params and searchParams before using their properties
  params = await params;
  searchParams = await searchParams;

  // Get conversationId from URL parameters
  const { conversationId } = params;

  // Get message limit from query params (e.g. /chat/123?limit=300)
  const requestedLimit = searchParams?.limit;

  const messageLimit = requestedLimit
    ? parseInt(requestedLimit)
    : MESSAGE_LIMITS.default;

  // Fetch conversation data
  const conversations = await fetchUserConversations();

  if (conversationId == "none") {
    // Process messages with type property

    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col h-screen overflow-hidden">
          <ChatDashboard
            initialConversationId={""}
            conversationsData={conversations.cleanConversations}
            initialMessages={[]}
            messageLimit={messageLimit}
          />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const { messages, error } = await fetchConversationMessages(
    conversationId,
    messageLimit
  );

  if (error) {
    console.error("Error loading messages:", error);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <ChatDashboard
          initialConversationId={conversationId}
          conversationsData={conversations.cleanConversations}
          initialMessages={messages}
          messageLimit={messageLimit}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export const dynamic = "force-dynamic";
