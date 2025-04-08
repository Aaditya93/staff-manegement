import { toast } from "sonner";
import { useState } from "react";
import { Paperclip, X } from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { downloadAttachment } from "@/actions/mail/attachments";
import { EmailMessage } from "./mail-display";

interface AttachmentProps {
  id: string;
  name: string;
  contentType: string;
  size: number;
  isInline: boolean;
}

interface MailAttachmentsProps {
  mail: EmailMessage;
  inboxNumber: number;
}

interface AttachmentListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export function MailAttachments({ mail, inboxNumber }: MailAttachmentsProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const handleDownloadAttachment = async (attachmentId: string) => {
    if (!mail) return;

    setIsLoading((prev) => ({ ...prev, [attachmentId]: true }));

    try {
      const result = await downloadAttachment(
        mail.id,
        attachmentId,
        inboxNumber
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.content && result.name && result.contentType) {
        // Create a blob from the base64 content
        const byteCharacters = atob(result.content);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);

          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: result.contentType });

        // Create a download link and trigger it
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = result.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast.error("Failed to download attachment");
    } finally {
      setIsLoading((prev) => ({ ...prev, [attachmentId]: false }));
    }
  };

  if (!mail.attachments || mail.attachments.length === 0) {
    return null;
  }

  return (
    <>
      <Separator />
      <div className="p-4">
        <h3 className="mb-2 text-sm font-medium">Attachments</h3>
        <div className="flex flex-wrap gap-2">
          {mail.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 rounded-md border p-2 text-sm"
            >
              <Paperclip className="h-4 w-4" />
              <span className="max-w-[200px] truncate">{attachment.name}</span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => handleDownloadAttachment(attachment.id)}
                disabled={isLoading[attachment.id]}
              >
                {isLoading[attachment.id] ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  "Download"
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function AttachmentList({ files, onRemoveFile }: AttachmentListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pb-2">
      {files.map((file, index) => (
        <div
          key={index}
          className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
        >
          <Paperclip className="size-4" />
          <span className="max-w-[120px] truncate">{file.name}</span>
          <Button
            onClick={() => onRemoveFile(index)}
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full p-0 opacity-70 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ))}
    </div>
  );
}
