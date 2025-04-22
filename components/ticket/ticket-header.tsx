import { Badge } from "@/components/ui/badge";
import { ITicket } from "@/db/models/ticket";

interface TicketHeaderProps {
  ticket: ITicket;
}

const TicketHeader = ({ ticket }: TicketHeaderProps) => {
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-500";
      case "in progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Ticket Details</h1>
      <Badge className={getStatusColor(ticket.status)}>
        {ticket.status.toUpperCase()}
      </Badge>
    </div>
  );
};

export default TicketHeader;
