import {
  getAllEmployees,
  getAllUnApprovedTickets,
} from "@/actions/approve-ticket/getTickets";
import AppSidebar from "@/components/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { PendingTicketsTable } from "@/components/pending-ticket/pending-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TbTicket } from "react-icons/tb";
import DatePickerWithRange from "@/components/pending-ticket/date-range";
import { Separator } from "@/components/ui/separator";
interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  country?: string;
  __v?: number;
}

interface Ticket {
  _id: { toString: () => string };
  companyName: string;
  destination: string;
  arrivalDate: string | Date;
  departureDate: string | Date;
  pax: number;
  receivedDateTime: string | Date;
  salesInCharge?: string;
  reservationInCharge?: string;
  [key: string]: any;
}
function extractDateRange(dateString: string) {
  try {
    if (!dateString) {
      throw new Error("No date string provided");
    }

    // Decode URL parameters if needed
    const decodedString = decodeURIComponent(dateString);

    // Extract dates using regex for better reliability
    const fromMatch = decodedString.match(/from=([^&]+)/);
    const toMatch = decodedString.match(/to=([^&]+)/);

    if (!fromMatch?.[1] || !toMatch?.[1]) {
      throw new Error("Date parameters not found");
    }

    const from = new Date(fromMatch[1]);
    const to = new Date(toMatch[1]);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new Error("Invalid date values");
    }

    return { from, to };
  } catch (error) {
    console.error("Error parsing date range:", error);
    const today = new Date();
    return {
      from: today,
      to: new Date(today.setDate(today.getDate() + 7)),
    };
  }
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

export const PendingTicketsPage = async ({
  params,
}: {
  params: Promise<{ range: string }>;
}) => {
  const { range } = await params;
  const dateRange = extractDateRange(range);
  const { from, to } = dateRange;

  const pendingTickets = await getAllUnApprovedTickets(from, to);
  const employees = await getAllEmployees();

  const serializedTickets = serializeData(pendingTickets);
  const serializedEmployee = serializeData(employees);

  const salesStaff = serializedEmployee.filter(
    (emp) => emp.role === "SalesStaff"
  ) as Employee[];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-y-auto">
        <main className="flex-1 p-4 md:p-6 pt-0">
          <Card className="w-full">
            <CardHeader className="border-b p-4 sm:p-3 bg-primary rounded-t-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <CardTitle className="flex items-center text-xl font-bold text-center sm:text-left text-primary-foreground">
                  <TbTicket className="mr-2 w-8 h-8 text-primary-foreground" />
                  Pending Tickets
                </CardTitle>
                <DatePickerWithRange />
                {/* You could add additional controls here if needed */}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {serializedTickets.length > 0 ? (
                <PendingTicketsTable
                  tickets={serializedTickets}
                  salesStaff={salesStaff}
                />
              ) : (
                <p className="text-muted-foreground">
                  No pending tickets found.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PendingTicketsPage;
export const dynamic = "force-dynamic";
