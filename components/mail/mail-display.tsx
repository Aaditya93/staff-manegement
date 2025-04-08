import { useState } from "react";
import { MailHeader } from "./mail-header";
import { MailContent } from "./mail-content";
import { MailAttachments } from "./mail-attachments";
import { MailReplyForm } from "./mail-reply-form";
import { ForwardDialog } from "./mail-forward-dialog";

export interface EmailMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
  sentDateTime: string;
  hasAttachments: boolean;
  isRead: boolean;
  body: {
    contentType: string;
    content: string;
  };
  from: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  sender?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  toRecipients?: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  ccRecipients?: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  bccRecipients?: Array<{
    emailAddress: {
      name: string;
      address: string;
    };
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    contentType: string;
    size: number;
    isInline: boolean;
  }>;
}

interface MailDisplayProps {
  mail: EmailMessage | null;
  inboxNumber: number;
  currentFolder?: string;
}

export function MailDisplay({
  mail,
  inboxNumber,
  currentFolder,
}: MailDisplayProps) {
  const [isForwarding, setIsForwarding] = useState(false);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <MailHeader
        mail={mail}
        inboxNumber={inboxNumber}
        onForwardClick={() => setIsForwarding(true)}
      />

      {mail ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <MailContent mail={mail} currentFolder={currentFolder} />

          {mail.attachments && mail.attachments.length > 0 && (
            <MailAttachments mail={mail} inboxNumber={inboxNumber} />
          )}

          <MailReplyForm mail={mail} inboxNumber={inboxNumber} />

          {isForwarding && (
            <ForwardDialog
              mail={mail}
              inboxNumber={inboxNumber}
              isOpen={isForwarding}
              onClose={() => setIsForwarding(false)}
            />
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
