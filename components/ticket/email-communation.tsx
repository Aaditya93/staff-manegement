import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmailList from "./email-list";
import EmailTimeline from "./email-timeline";
import { EmailEntry } from "./types";

interface EmailCommunicationProps {
  emails: EmailEntry[];
}

const EmailCommunication = ({ emails }: EmailCommunicationProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Communication
        </CardTitle>
        <CardDescription>
          {emails.length} email(s) in this conversation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="emails">
          <TabsList className="mb-4">
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="emails">
            <EmailList emails={emails} />
          </TabsContent>

          <TabsContent value="timeline">
            <EmailTimeline emails={emails} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EmailCommunication;
