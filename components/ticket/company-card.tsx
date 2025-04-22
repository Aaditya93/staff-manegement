import { ITicket } from "@/db/models/ticket";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, DollarSign, Users } from "lucide-react";

interface CompanyInfoCardProps {
  ticket: ITicket;
}

const CompanyInfoCard = ({ ticket }: CompanyInfoCardProps) => {
  // Helper function to format dates
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {ticket.destination}
        </CardTitle>
        <CardDescription>{ticket.companyName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Arrival
          </span>
          <span className="font-medium">{formatDate(ticket.arrivalDate)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Departure
          </span>
          <span className="font-medium">
            {formatDate(ticket.departureDate)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            PAX
          </span>
          <span className="font-medium">{ticket.pax}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4" />
            Cost
          </span>
          <span className="font-medium">${ticket.cost.toFixed(2)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Speed
          </span>
          <Badge variant="outline" className="capitalize">
            {ticket.speed}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;
