/**
 * Processes inquiry data and returns chart data grouped by speed
 * @param inquiries Array of inquiry objects
 * @returns Chart data formatted for horizontal bar visualization
 */
export function processInquiriesBySpeed(inquiries) {
  // Initialize counts for each speed category
  const speedCounts = {
    slow: 0,
    normal: 0,
    fast: 0,
    urgent: 0,
  };

  // Define colors for different speed categories
  const speedColors = {
    slow: "hsl(221.2, 83.2%, 53.3%)", // --chart-1
    normal: "hsl(212, 95%, 68%)", // --chart-2
    fast: "hsl(216, 92%, 60%)", // --chart-3
    urgent: "hsl(210, 98%, 78%)", // --chart-4
  };

  // Count inquiries by speed
  inquiries.forEach((inquiry) => {
    const speed = inquiry.speed?.toLowerCase() || "normal";
    if (speedCounts.hasOwnProperty(speed)) {
      speedCounts[speed]++;
    } else {
      // Default to normal if speed is not in our categories
      speedCounts.normal++;
    }
  });

  // Convert to array format for the chart
  const chartData = Object.keys(speedCounts).map((speed) => ({
    speed,
    totalTickets: speedCounts[speed],
    fill: speedColors[speed],
  }));

  return chartData;
}

/**
 * Processes a single inquiry for the speed chart
 * @param inquiry Single inquiry object
 * @returns Chart data for a single inquiry
 */
export function processSingleInquiry(inquiry) {
  return processInquiriesBySpeed([inquiry]);
}

/**
 * Calculates the average waiting time across all inquiries, excluding those with 0 waiting time
 * @param inquiries Array of inquiry objects
 * @returns Average waiting time in seconds, or 0 if no valid inquiries found
 */
export function calculateAverageWaitingTime(inquiries) {
  if (!Array.isArray(inquiries) || inquiries.length === 0) {
    return 0;
  }

  // Filter inquiries with waiting time > 0
  const validInquiries = inquiries.filter(
    (inquiry) =>
      inquiry &&
      typeof inquiry.waitingTime === "number" &&
      inquiry.waitingTime > 0
  );

  if (validInquiries.length === 0) {
    return 0;
  }

  // Calculate sum of waiting times
  const totalWaitingTime = validInquiries.reduce(
    (sum, inquiry) => sum + inquiry.waitingTime,
    0
  );

  // Return average waiting time
  return totalWaitingTime / validInquiries.length;
}

/**
 * Formats waiting time in seconds to a human-readable string
 * @param waitingTimeSeconds Waiting time in seconds
 * @returns Formatted string (e.g., "2h 30m" or "45m")
 */
export function formatWaitingTime(waitingTimeSeconds) {
  if (!waitingTimeSeconds || waitingTimeSeconds <= 0) {
    return "0m";
  }

  const hours = Math.floor(waitingTimeSeconds / 3600);
  const minutes = Math.floor((waitingTimeSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
