import { getAllReports } from "@/actions/report/getReport";
import ReportList from "@/components/report/report-list";
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

export const ReportListPage = async ({
  params,
}: {
  params: Promise<{ range: string }>;
}) => {
  const { range } = await params;
  const dateRange = extractDateRange(range);
  const { from, to } = dateRange;

  const reports = await getAllReports(from, to);

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-auto">
        <div className="flex-1 ">
          <div className="hidden md:flex h-full w-full border-b p-4">
            <ReportList reports={reports} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ReportListPage;
export const dynamic = "force-dynamic";
