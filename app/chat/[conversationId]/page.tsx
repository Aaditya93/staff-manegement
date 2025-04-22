import { ChatDashboard } from "@/components/chat/chat-dashboard";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { fetchConversationMessages } from "@/actions/chat/conversation";
import { serializeData } from "@/utils/serialize";
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
  // Await params and searchParams before using their properties
  params = await params;
  searchParams = await searchParams;

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

  // Fetch messages for the conversation with the specified limit
  const { messages, error } = await fetchConversationMessages(
    conversationId,
    messageLimit
  );

  if (error) {
    console.error("Error loading messages:", error);
  }

  // Process messages with type property
  const safeMessages = serializeData(messages) || [];
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <ChatDashboard
          initialMessages={safeMessages}
          messageLimit={messageLimit}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

export const dynamic = "force-dynamic";
