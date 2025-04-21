export const mapTicketsToTableData = (tickets: any[]): TravelBooking[] => {
  return tickets.map((ticket) => ({
    companyName: ticket.companyName || "",
    receivedTime: ticket.receivedDateTime
      ? new Date(ticket.receivedDateTime).toLocaleString()
      : "",
    noOfPax: ticket.pax || 0,
    ticket: ticket._id || "",
    destination: ticket.destination || "",
    arrival: ticket.arrivalDate
      ? new Date(ticket.arrivalDate).toISOString().split("T")[0]
      : "",
    departure: ticket.departureDate
      ? new Date(ticket.departureDate).toISOString().split("T")[0]
      : "",
    reservationInCharge: ticket.reservationInCharge?.name || "",
    salesInCharge: ticket.salesInCharge?.name || "",
    market: ticket.market || "",
    status: ticket.status || "In Progress",
    estimateTimeToSendPrice: ticket.estimateTimeToSendPrice || 0,
    waitingTime: ticket.waitingTime || 0,
    speed: ticket.speed || "",
    inbox: ticket.inbox || 0,
    sent: ticket.sent || 0,
    timeSent: ticket.sentDateTime
      ? new Date(ticket.sentDateTime).toLocaleString()
      : "",
    lastInbox: new Date(ticket.lastMailTimeReceived).toLocaleString() || "",
    lastSent: ticket.lastMailTimeSent
      ? new Date(ticket.lastMailTimeSent).toLocaleString()
      : "",
    balance: ticket.sent - ticket.inbox || 0,
    costOfPackage: ticket.cost || 0,
  }));
};
