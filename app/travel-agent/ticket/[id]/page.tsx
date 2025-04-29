import { getTicketById } from "@/actions/tickets/tickets";
import AppSidebar from "@/components/travel-agent/app-sidebar";
import TicketDashboard from "@/components/travel-agent/ticket/ticket-dashbaord";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
const TicketPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const ticket = await getTicketById(id);

  console.log("ticket", ticket);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen ">
        <div className="flex-1 ">
          <div className="hidden md:flex h-full w-full border-b">
            <TicketDashboard ticket={ticket} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
export default TicketPage;
