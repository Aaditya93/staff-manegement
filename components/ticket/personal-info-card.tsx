import { ITicket } from "@/db/models/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface PersonnelInfoCardProps {
  ticket: ITicket;
}

const PersonnelInfoCard = ({ ticket }: PersonnelInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personnel Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Sales In Charge
          </h3>
          <div className="bg-secondary/50 p-3 rounded-md">
            <p className="font-medium">{ticket.salesInCharge.name}</p>
            <p className="text-sm text-muted-foreground">
              {ticket.salesInCharge.emailId}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Reservation In Charge
          </h3>
          <div className="bg-secondary/50 p-3 rounded-md">
            <p className="font-medium">{ticket.reservationInCharge.name}</p>
            <p className="text-sm text-muted-foreground">
              {ticket.reservationInCharge.emailId}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Travel Agent
          </h3>
          <div className="bg-secondary/50 p-3 rounded-md">
            <p className="font-medium">{ticket.travelAgent.name}</p>
            <p className="text-sm text-muted-foreground">
              {ticket.travelAgent.emailId}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonnelInfoCard;
