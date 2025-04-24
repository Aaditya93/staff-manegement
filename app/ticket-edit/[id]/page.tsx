import { getTicketById } from "@/actions/tickets/tickets";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { getAllEmployees } from "@/actions/approve-ticket/getTickets";
import EditTicketForm from "@/components/ticket/ticket-form";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const EditTicketPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const ticket = await getTicketById(id);
  const employees = await getAllEmployees();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen ">
        <div className="flex-1 ">
          <div className="hidden md:flex h-full w-full border-b">
            <EditTicketForm ticket={ticket} employees={employees} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
export default EditTicketPage;
