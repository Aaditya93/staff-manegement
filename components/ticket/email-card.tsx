"use client";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmailEntry } from "./types";

interface EmailCardProps {
  email: EmailEntry;
}

const EmailCard = ({ email }: EmailCardProps) => {
  return (
    <Card key={email.id} className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium">
              From: {email.from.name}{" "}
              <span className="text-muted-foreground">
                &lt;{email.from.email}&gt;
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              To: {email.to.map((to) => to.name).join(", ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Rating: {email.rating}/10</Badge>
            <Badge
              variant={email.emailType === "received" ? "secondary" : "default"}
            >
              {email.emailType === "received" ? "Received" : "Sent"}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {email.timestamp ? format(new Date(email.timestamp), "PPpp") : "N/A"}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{email.emailSummary}</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(email.weblink, "_blank")}
          >
            Open in Outlook
          </Button>
          <Button size="sm">Open Email</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailCard;
