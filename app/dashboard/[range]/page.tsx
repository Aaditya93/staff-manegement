import { getAllTicketsByEmail } from "@/actions/tickets/tickets";
import Dashboard from "@/components/dashboard/dashboard";
import { serializeData } from "@/utils/serialize";
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
const DashboardPage = async ({
  params,
}: {
  params: Promise<{ range: string }>;
}) => {
  const { range } = await params;
  const dateRange = extractDateRange(range);

  const tickets = await getAllTicketsByEmail(dateRange.from, dateRange.to);
  const serializedTickets = await serializeData(tickets);
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-4 border-b">
      <Dashboard tickets={serializedTickets} />
    </div>
  );
};

export default DashboardPage;
export const dynamic = "force-dynamic";
