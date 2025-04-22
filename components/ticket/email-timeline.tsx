import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmailEntry } from "./types";

interface EmailTimelineProps {
  emails: EmailEntry[];
}

const EmailTimeline = ({ emails }: EmailTimelineProps) => {
  return (
    <div className="relative pl-6 border-l-2 border-muted space-y-6 py-2">
      {emails.map((email) => (
        <div key={email.id} className="relative">
          <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary"></div>
          <div className="mb-1">
            <p className="text-sm font-medium">
              {email.timestamp
                ? format(new Date(email.timestamp), "MMM dd, yyyy")
                : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {email.timestamp ? format(new Date(email.timestamp), "p") : ""}
            </p>
          </div>
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    {email.emailType === "received"
                      ? "Received from"
                      : "Sent to"}
                    : {email.from.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {email.emailSummary.substring(0, 100)}...
                  </p>
                </div>
                <Badge
                  variant={
                    email.emailType === "received" ? "secondary" : "default"
                  }
                >
                  {email.emailType === "received" ? "Received" : "Sent"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default EmailTimeline;
