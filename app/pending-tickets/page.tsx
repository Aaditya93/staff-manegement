import { getTickets } from "@/actions/approve-ticket/getTickets";
import AppSidebar from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { approveTicket } from "@/actions/approve-ticket/getTickets";
import { ITicket } from "@/db/models/ticket"; // Import ITicket if not already imported
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const reservationAgents = [
  { id: "agent1", name: "Alice Smith" },
  { id: "agent2", name: "Bob Johnson" },
  { id: "agent3", name: "Charlie Brown" },
];
// Helper component for the approve button to handle form action
function ApproveControl({ ticketId }: { ticketId: string }) {
  // Use a form action to call the server action
  const approveAction = async (formData: FormData) => {
    "use server"; // Required for form actions calling server actions

    const reservationInCharge = formData.get("reservationInCharge") as string;
    const ticketIdFromData = formData.get("ticketId") as string; // Get ticketId from hidden input

    if (!reservationInCharge) {
      // Handle error - maybe return an error state or log
      console.error("Reservation in charge not selected.");
      // You might want to return a specific error object here if needed
      // For simplicity, we'll rely on the server action's validation for now
      alert("Please select a Reservation Agent."); // Simple feedback
      return;
    }

    if (!ticketIdFromData) {
      console.error("Ticket ID missing from form data.");
      alert("An error occurred: Ticket ID missing.");
      return;
    }

    const result = await approveTicket(ticketIdFromData, reservationInCharge);

    if (!result.success) {
      // Handle error appropriately, maybe show a toast notification
      console.error("Failed to approve ticket:", result.error);
      alert(`Error: ${result.error}`); // Simple alert for now
    }
    // Revalidation is handled within the action itself
  };

  return (
    // Use the form action directly
    <form action={approveAction} className="flex items-center gap-2">
      {/* Hidden input to pass ticketId */}
      <input type="hidden" name="ticketId" value={ticketId} />

      <Select name="reservationInCharge" required>
        {" "}
        {/* Add name attribute */}
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Reservation Incharge" />
        </SelectTrigger>
        <SelectContent>
          {reservationAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.name}>
              {" "}
              {/* Use a meaningful value */}
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" variant="outline">
        Approve
      </Button>
    </form>
  );
}

export default async function PendingTicketsPage() {
  const pendingTickets: ITicket[] = await getTickets(); // Ensure type safety

  // Function to format date nicely
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    // Use toLocaleString to get both date and time
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit", // Add hour
      minute: "2-digit", // Add minute
      hour12: true, // Use AM/PM format
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-y-auto">
        {" "}
        {/* Allow vertical scroll */}
        <header className="sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center gap-2 border-b">
          {" "}
          {/* Make header sticky */}
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pending Tickets</BreadcrumbPage>{" "}
                  {/* Updated breadcrumb */}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-semibold mb-4">Pending Approval</h1>
          {pendingTickets.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead className="text-center">Pax</TableHead>
                    {/* Changed Header */}
                    <TableHead>Received Time</TableHead>
                    {/* Align Actions header to the right */}
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTickets.map((ticket) => (
                    <TableRow key={ticket._id.toString()}>
                      <TableCell>{ticket.agent}</TableCell>
                      <TableCell>{ticket.destination}</TableCell>
                      <TableCell>{formatDate(ticket.arrivalDate)}</TableCell>
                      <TableCell>{formatDate(ticket.departureDate)}</TableCell>
                      <TableCell className="text-center">
                        {ticket.pax}
                      </TableCell>
                      {/* Changed Cell Content */}
                      <TableCell>
                        {formatDateTime(ticket.receivedDateTime)}
                      </TableCell>
                      {/* Cell for Actions - alignment handled by ApproveControl's form */}
                      <TableCell>
                        <ApproveControl ticketId={ticket._id.toString()} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No pending tickets found.</p>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
export const dynamic = "force-dynamic";
