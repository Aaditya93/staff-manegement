import { ITicket } from "@/db/models/ticket";

interface ChartData {
  date: string;
  totalApplication: number;
  revenue: number;
}

/**
 * Converts an array of tickets into daily aggregated data for the line chart
 * @param tickets Array of ticket objects
 * @param dateField Which date field to use for grouping ('receivedDateTime' or 'createdAt')
 * @returns Array of chart data points with date, totalApplication count, and revenue
 */
export function convertTicketsToChartData(
  tickets: ITicket[],
  dateField: "receivedDateTime" | "createdAt" = "receivedDateTime"
): ChartData[] {
  // Early return if no tickets
  if (!tickets || tickets.length === 0) {
    return [];
  }

  // Create maps to group tickets by date
  const ticketsByDate: Record<string, number> = {};
  const revenueByDate: Record<string, number> = {};

  // Process each ticket and group by date
  tickets.forEach((ticket) => {
    // Get the date string from the specified field
    const dateStr = ticket[dateField];

    if (!dateStr) return;

    // Format the date to YYYY-MM-DD
    const date = new Date(dateStr);
    const formattedDate = date.toISOString().split("T")[0];

    // Increment the count for this date
    ticketsByDate[formattedDate] = (ticketsByDate[formattedDate] || 0) + 1;

    // Add revenue if ticket status is complete and has cost property
    if (ticket.status === "complete" && ticket.cost) {
      revenueByDate[formattedDate] =
        (revenueByDate[formattedDate] || 0) +
        (typeof ticket.cost === "number" ? ticket.cost : 0);
    }
  });

  // Convert the maps to an array of ChartData objects
  let chartData: ChartData[] = Object.entries(ticketsByDate).map(
    ([date, count]) => ({
      date,
      totalApplication: count,
      revenue: revenueByDate[date] || 0,
    })
  );

  // Sort the data by date
  chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // If there are gaps in dates, fill them with zero values
  if (chartData.length > 1) {
    const filledChartData: ChartData[] = [];
    const firstDate = new Date(chartData[0].date);
    const lastDate = new Date(chartData[chartData.length - 1].date);

    const currentDate = new Date(firstDate);

    // Iterate through each day from first to last
    while (currentDate <= lastDate) {
      const currentDateStr = currentDate.toISOString().split("T")[0];
      const existingDataPoint = chartData.find(
        (item) => item.date === currentDateStr
      );

      if (existingDataPoint) {
        filledChartData.push(existingDataPoint);
      } else {
        // Add a zero entry for dates with no tickets
        filledChartData.push({
          date: currentDateStr,
          totalApplication: 0,
          revenue: 0,
        });
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledChartData;
  }

  return chartData;
}
