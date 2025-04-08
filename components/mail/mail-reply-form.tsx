import { toast } from "sonner";
import { useRef, useState } from "react";
import { Paperclip } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { EmojiPickerPopover } from "./emojis";
import { sendEmail } from "@/actions/mail/send-email";
import { EmailMessage } from "./mail-display";
import { AttachmentList } from "./mail-attachments";
import { fileToBase64 } from "@/utils/sanitize-email";

interface MailReplyFormProps {
  mail: EmailMessage;
  inboxNumber: number;
}

export function MailReplyForm({ mail, inboxNumber }: MailReplyFormProps) {
  const [replyText, setReplyText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

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

  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insert emoji at cursor position
    const newText =
      replyText.substring(0, start) + emoji + replyText.substring(end);

    setReplyText(newText);

    // After state update, we need to set the cursor position after the inserted emoji
    // This needs to be in a setTimeout to work after React's state update
    setTimeout(() => {
      const newCursorPos = start + emoji.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      try {
        // Set loading state
        setIsLoading(true);

        // Prepare attachments if any
        interface EmailAttachment {
          "@odata.type": string;
          name: string;
          contentType: string;
          contentBytes: string;
        }

        let emailAttachments: EmailAttachment[] = [];
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
          subject: `Re: ${mail?.subject || "No Subject"}`,
          inboxNumber: inboxNumber,
          body: replyText,
          toRecipients: [mail.from.emailAddress.address],
          attachments: emailAttachments,
        };

        // Send the email using the server action
        const result = await sendEmail(emailData);

        if (result.success) {
          toast.success("Reply sent successfully");
          setReplyText(""); // Clear the textarea after sending
          setFiles([]); // Clear attachments
        } else {
          toast.error(result.error || "Failed to send reply");
        }
      } catch (error) {
        console.error("Error sending reply:", error);
        toast.error("An error occurred while sending the reply");
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please enter a reply first");
    }
  };

  return (
    <>
      <Separator className="mt-auto" />
      <div className="p-4">
        <form onSubmit={handleSendReply}>
          <div className="grid gap-4">
            <Textarea
              ref={textareaRef}
              className="p-4"
              placeholder={`Reply to ${mail.from.emailAddress.name}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />

            <AttachmentList files={files} onRemoveFile={handleRemoveFile} />

            {/* Reply controls */}
            <div className="flex items-center">
              <EmojiPickerPopover onEmojiSelect={handleEmojiSelect} />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor="file-upload"
                    className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl"
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      ref={uploadInputRef}
                    />
                    <Paperclip className="text-primary size-4" />
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="top">Attach files</TooltipContent>
              </Tooltip>

              <Button
                type="submit"
                size="sm"
                className="ml-auto"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
