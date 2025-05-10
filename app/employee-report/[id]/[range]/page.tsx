import { getTicketsForEmployee } from "@/actions/employee-report/getTickets";
import EmployeeReport from "@/components/employee-report/report";

import AppSidebar from "@/components/sidebar/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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

const PaymentPage = async ({
  params,
}: {
  params: Promise<{ id: string; range: string }>;
}) => {
  const { id, range } = await params;
  const dateRange = extractDateRange(range);
  const data = await getTicketsForEmployee({
    userId: id,
    startDate: dateRange.from,
    endDate: dateRange.to,
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <EmployeeReport tickets={data.tickets} user={data.user} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PaymentPage;

export const dynamic = "force-dynamic";
