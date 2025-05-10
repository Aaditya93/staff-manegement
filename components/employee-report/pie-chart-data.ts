/**
 * Processes inquiry data and returns pie chart data grouped by status
 * @param inquiries Array of inquiry objects
 * @returns Chart data formatted for pie chart visualization and metrics
 */
export function processInquiriesToChartData(inquiries) {
  // Define status mapping for display
  const statusMapping = {
    new: "pending",
    quote_sent: "quote_sent",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
  };

  // Define colors for different statuses
  const statusColors = {
    pending: "hsl(221.2, 83.2%, 53.3%)",
    quote_sent: "hsl(212, 95%, 68%)",
    in_progress: "hsl(216, 92%, 60%)",
    completed: "hsl(210, 98%, 78%)",
    cancelled: "hsl(212, 97%, 87%)",
  };

  // Group inquiries by status
  const statusGroups = inquiries.reduce((groups, inquiry) => {
    const mappedStatus = statusMapping[inquiry.status] || "pending";

    if (!groups[mappedStatus]) {
      groups[mappedStatus] = {
        status: mappedStatus,
        totalTickets: 0,
        fill: statusColors[mappedStatus],
      };
    }

    groups[mappedStatus].totalTickets += 1;
    return groups;
  }, {});

  // Calculate total and completed inquiries for conversion rate
  const totalInquiries = inquiries.length;
  const completedInquiries = statusGroups.completed?.totalTickets || 0;

  // Calculate conversion rate (completed inquiries / total inquiries)
  const conversionRate =
    totalInquiries > 0 ? (completedInquiries / totalInquiries) * 100 : 0;

  // Convert grouped data to array format
  return {
    chartData: Object.values(statusGroups),
    metrics: {
      totalInquiries,
      completedInquiries,
      conversionRate: parseFloat(conversionRate.toFixed(2)), // Round to 2 decimal places
    },
  };
}
