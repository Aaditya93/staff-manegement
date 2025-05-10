import { getTicketsForTravelAgent } from "@/actions/travel-agent/travel-agent-report";
import { DestinationBarChart } from "@/components/admin-report/market-bar-chart";
import AppSidebar from "@/components/travel-agent/app-sidebar";
import TravelAgentReport from "@/components/travel-agent/travel-agent-report/report";
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

const TravelAgentReportPage = async ({
  params,
}: {
  params: Promise<{ id: string; range: string }>;
}) => {
  const { id, range } = await params;
  const dateRange = extractDateRange(range);
  const data = await getTicketsForTravelAgent({
    userId: id,
    startDate: dateRange.from,
    endDate: dateRange.to,
  });
  console.log("data", data.tickets);
  console.log("user", data.user);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <TravelAgentReport tickets={data.tickets} user={data.user} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default TravelAgentReportPage;

export const dynamic = "force-dynamic";
