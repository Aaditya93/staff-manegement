export function convertTicketsToDestinationChartData(tickets: ITicket[]) {
  // Group tickets by destination
  const destinationMap = new Map<
    string,
    { totalTickets: number; totalRevenue: number }
  >();

  tickets.forEach((ticket) => {
    const destination = ticket.destination || "Unknown";

    if (!destinationMap.has(destination)) {
      destinationMap.set(destination, {
        totalTickets: 0,
        totalRevenue: 0,
      });
    }

    const currentStats = destinationMap.get(destination)!;
    // Count number of tickets (1 per ticket) instead of passenger count
    currentStats.totalTickets += 1;
    // Only add cost to total revenue if status is complete
    if (ticket.status?.toLowerCase() === "completed") {
      currentStats.totalRevenue += ticket.cost || 0;
    }
  });

  // Convert map to array format needed for the chart
  return Array.from(destinationMap.entries()).map(([destination, stats]) => ({
    destination: destination, // Using 'destination' as the key for the x-axis in the chart
    totalTickets: stats.totalTickets, // Number of tickets count
    revenue: stats.totalRevenue,
  }));
}
