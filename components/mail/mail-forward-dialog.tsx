import { toast } from "sonner";
import { format } from "date-fns/format";
import { useRef, useState } from "react";
import { X, Paperclip } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { sendEmail } from "@/actions/mail/send-email";
import { EmailMessage } from "./mail-display";
import { fileToBase64 } from "@/utils/sanitize-email";
import { AttachmentList } from "./mail-attachments";

interface ForwardDialogProps {
  mail: EmailMessage;
  inboxNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ForwardDialog({
  mail,
  inboxNumber,
  isOpen,
  onClose,
}: ForwardDialogProps) {
  const [forwardRecipients, setForwardRecipients] = useState("");
  const [forwardText, setForwardText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const forwardTextareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Prepare forward content when dialog opens
  useState(() => {
    if (isOpen && mail) {
      let content = "";

      if (mail.body.contentType === "html") {
        // For HTML emails, create a nicely formatted header as HTML
        const originalSender = mail.from.emailAddress.name;
        const originalEmail = mail.from.emailAddress.address;
        const originalDate = format(new Date(mail.receivedDateTime), "PPpp");
        const originalSubject = mail.subject;

        // Create HTML formatted header
        const forwardHeader = `
          <div style="padding: 10px 0; margin-bottom: 20px; border-bottom: 1px solid #e0e0e0;">
            <p style="margin: 5px 0; color: #666;">---------- Forwarded message ---------</p>
            <p style="margin: 5px 0;"><b>From:</b> ${originalSender} &lt;${originalEmail}&gt;</p>
            <p style="margin: 5px 0;"><b>Date:</b> ${originalDate}</p>
            <p style="margin: 5px 0;"><b>Subject:</b> ${originalSubject}</p>
            <p style="margin: 5px 0;"><b>To:</b> ${mail.from.emailAddress.address}</p>
          </div>
        `;

        // Combine header with original HTML content
        content = forwardHeader + mail.body.content;
      } else {
        // For plain text emails, format as plain text
        const originalSender = mail.from.emailAddress.name;
        const originalDate = format(new Date(mail.receivedDateTime), "PPpp");
        const originalSubject = mail.subject;

        let textContent = `\n\n---------- Forwarded message ---------\n`;
        textContent += `From: ${originalSender} <${mail.from.emailAddress.address}>\n`;
        textContent += `Date: ${originalDate}\n`;
        textContent += `Subject: ${originalSubject}\n`;
        textContent += `To: ${mail.from.emailAddress.address}\n\n`;

        content = textContent + mail.body.content;
      }

      setForwardText(content);
    }
  }, [isOpen, mail]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadInputRef?.current) {
      uploadInputRef.current.value = "";
    }
  };

  const handleForward = async () => {
    // Validate recipients
    if (!forwardRecipients.trim()) {
      toast.error("Please enter at least one recipient email");
      return;
    }

    const recipientList = forwardRecipients
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    if (recipientList.length === 0) {
      toast.error("Please enter valid recipient emails");
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Process attachments
      let emailAttachments = [];
      if (files.length > 0) {
        // Process each file to get base64 content
        emailAttachments = await Promise.all(
          files.map(async (file) => {
            const base64Content = await fileToBase64(file);
            return {
              "@odata.type": "#microsoft.graph.fileAttachment",
              name: file.name,
              contentType: file.type,
              contentBytes: base64Content,
            };
          })
        );
      }

      // Prepare email data
      const emailData = {
        subject: `Fwd: ${mail.subject}`,
        inboxNumber: inboxNumber,
        body: forwardText,
        toRecipients: recipientList,
        attachments: emailAttachments,
      };

      // Send the forwarded email
      const result = await sendEmail(emailData);

      if (result.success) {
        toast.success("Email forwarded successfully");
        onClose();
        setForwardRecipients("");
        setForwardText("");
        setFiles([]);
      } else {
        toast.error(result.error || "Failed to forward email");
      }
    } catch (error) {
      console.error("Error forwarding email:", error);
      toast.error("An error occurred while forwarding the email");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-background p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Forward Email</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <Label
            htmlFor="forward-to"
            className="mb-2 block text-sm font-medium"
          >
            To:
          </Label>
          <input
            id="forward-to"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="email@example.com, anotheremail@example.com"
            value={forwardRecipients}
            onChange={(e) => setForwardRecipients(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <Label
            htmlFor="forward-subject"
            className="mb-2 block text-sm font-medium"
          >
            Subject:
          </Label>
          <input
            id="forward-subject"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={`Fwd: ${mail.subject}`}
            readOnly
          />
        </div>

        <div className="mb-4">
          <Label
            htmlFor="forward-message"
            className="mb-2 block text-sm font-medium"
          >
            Message:
          </Label>
          <Textarea
            id="forward-message"
            ref={forwardTextareaRef}
            className="min-h-[200px] w-full"
            value={forwardText}
            onChange={(e) => setForwardText(e.target.value)}
          />
        </div>

        {/* File attachments from original email */}
        {mail.attachments && mail.attachments.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-medium">Original Attachments:</h4>
            <div className="flex flex-wrap gap-2">
              {mail.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-md border p-2 text-sm"
                >
                  <Paperclip className="h-4 w-4" />
                  <span className="max-w-[200px] truncate">
                    {attachment.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments for forwarded email */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium">Forward with Attachments:</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label
                  htmlFor="forward-file-upload"
                  className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl"
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="forward-file-upload"
                    ref={uploadInputRef}
                  />
                  <Paperclip className="text-primary size-4" />
                </Label>
              </TooltipTrigger>
              <TooltipContent side="top">Attach files</TooltipContent>
            </Tooltip>
          </div>

          <AttachmentList files={files} onRemoveFile={handleRemoveFile} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleForward} disabled={isLoading}>
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            ) : (
              "Forward"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
