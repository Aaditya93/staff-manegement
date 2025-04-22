import { ITicket } from "@/db/models/ticket";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmailStatsCardProps {
  ticket: ITicket;
}

const EmailStatsCard = ({ ticket }: EmailStatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 p-4 rounded-md text-center">
              <p className="text-2xl font-bold">{ticket.inbox}</p>
              <p className="text-sm text-muted-foreground">Received</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-md text-center">
              <p className="text-2xl font-bold">{ticket.sent}</p>
              <p className="text-sm text-muted-foreground">Sent</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Received Date/Time</p>
            <p className="bg-secondary/50 p-2 rounded-md">
              {ticket.receivedDateTime
                ? format(new Date(ticket.receivedDateTime), "PPpp")
                : "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Sent Date/Time</p>
            <p className="bg-secondary/50 p-2 rounded-md">
              {ticket.sentDateTime
                ? format(new Date(ticket.sentDateTime), "PPpp")
                : "N/A"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Waiting Time</p>
            <p className="bg-secondary/50 p-2 rounded-md">
              {ticket.waitingTime} minutes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailStatsCard;
