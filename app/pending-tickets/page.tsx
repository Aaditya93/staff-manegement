import {
  getAllEmployees,
  getAllUnApprovedTickets,
} from "@/actions/approve-ticket/getTickets";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { TicketProvider } from "@/components/pending-ticket/context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApproveControl } from "@/components/pending-ticket/approve";

import { SelectSalesStaff } from "@/components/pending-ticket/select-sales";
import { SelectReservationStaff } from "@/components/pending-ticket/select-reservation";

interface Employee {
  _id: string | unknown;
  name: string;
  email: string;
  role: string;
  country?: string;
  __v?: number;
  // Add other fields as needed
}
export function serializeData(data: any) {
  // Use replacer function to handle circular references
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return; // Don't serialize circular references
        }
        seen.add(value);
      }
      return value;
    })
  );
}

export default async function PendingTicketsPage() {
  // Get raw data first
  const pendingTickets = await getAllUnApprovedTickets();
  const employees = await getAllEmployees();

  // Safely serialize data
  const serializedTickets = serializeData(pendingTickets);
  const serializedEmployee = serializeData(employees);

  // Filter employees by role
  const salesStaff = serializedEmployee.filter(
    (emp) => emp.role === "SalesStaff"
  ) as Employee[];

  const reservationStaff = serializedEmployee.filter(
    (emp) => emp.role === "ReservationStaff"
  ) as Employee[];

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
        <header className="sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center px-4 border-b">
          <h1 className="text-2xl font-semibold">Pending Approval</h1>
          <div className="flex items-center gap-2"></div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {pendingTickets.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Pax</TableHead>
                    <TableHead>Received Time</TableHead>
                    <TableHead>Sales Staff</TableHead>
                    <TableHead>Reservation Staff</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serializedTickets.map((ticket) => (
                    <TableRow key={ticket._id.toString()}>
                      <TicketProvider ticketId={ticket._id.toString()}>
                        <TableCell>{ticket.companyName}</TableCell>
                        <TableCell>{ticket.destination}</TableCell>
                        <TableCell>{formatDate(ticket.arrivalDate)}</TableCell>
                        <TableCell>
                          {formatDate(ticket.departureDate)}
                        </TableCell>
                        <TableCell>{ticket.pax}</TableCell>
                        <TableCell>
                          {formatDateTime(ticket.receivedDateTime)}
                        </TableCell>
                        <TableCell>
                          <SelectSalesStaff
                            staffList={salesStaff}
                            default={ticket.salesInCharge}
                          />
                        </TableCell>
                        <TableCell>
                          <SelectReservationStaff
                            staffList={reservationStaff}
                            default={ticket.reservationInCharge}
                          />
                        </TableCell>
                        <TableCell>
                          <ApproveControl ticketId={ticket._id.toString()} />
                        </TableCell>
                      </TicketProvider>
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
