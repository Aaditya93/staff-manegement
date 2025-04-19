import { ChatDashboard } from "@/components/chat/chat-dashboard";
import AppSidebar from "@/components/sidebar/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function MessegingPage() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-hidden ">
        <ChatDashboard />
      </SidebarInset>
    </SidebarProvider>
  );
}
export const dynamic = "force-dynamic";
