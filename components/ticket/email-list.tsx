import { ScrollArea } from "@/components/ui/scroll-area";
import EmailCard from "./email-card";
import { EmailEntry } from "./types";
interface EmailListProps {
  emails: EmailEntry[];
}

const EmailList = ({ emails }: EmailListProps) => {
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {emails.map((email) => (
          <EmailCard key={email.id} email={email} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default EmailList;
