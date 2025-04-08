import { toast } from "sonner";
import { format } from "date-fns/format";
import {
  Archive,
  ArchiveX,
  Forward,
  MoreVertical,
  Paperclip,
  Reply,
  ReplyAll,
  Trash2,
  X,
} from "lucide-react";
import sanitizeHtml from "sanitize-html";
import { downloadAttachment, sendEmail } from "@/actions/mail/mail";
import { markAsUnread, toggleEmailFlag } from "@/actions/mail/mail";
import { Star } from "lucide-react"; // Add this import
import { useRef } from "react";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import { moveToArchive, moveToJunk, moveToTrash } from "@/actions/mail/mail";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmojiPickerPopover } from "./emojis";
import { Label } from "../ui/label";

export interface EmailMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
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
  attachments: Array<{
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
}

export function MailDisplay({ mail, inboxNumber }: MailDisplayProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const uploadInputRef = useRef<HTMLInputElement>(null);

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
  const handleArchive = async (id: string) => {
    if (!id) return;

    setIsLoading((prev) => ({ ...prev, archive: true }));

    try {
      const result = await moveToArchive(id, inboxNumber);

      if (result.success) {
        toast.success("Email moved to archive");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to archive email");
      }
    } catch (error) {
      console.error("Error archiving email:", error);
      toast.error("Something went wrong when archiving");
    } finally {
      setIsLoading((prev) => ({ ...prev, archive: false }));
    }
  };

  // Handler for junk action
  const handleMoveToJunk = async (id: string) => {
    if (!id) return;

    setIsLoading((prev) => ({ ...prev, junk: true }));

    try {
      const result = await moveToJunk(id, inboxNumber);

      if (result.success) {
        toast.success("Email moved to junk folder");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to move email to junk");
      }
    } catch (error) {
      console.error("Error moving email to junk:", error);
      toast.error("Something went wrong when moving to junk");
    } finally {
      setIsLoading((prev) => ({ ...prev, junk: false }));
    }
  };

  // Handler for trash action
  const handleMoveToTrash = async (id: string) => {
    if (!id) return;

    setIsLoading((prev) => ({ ...prev, trash: true }));

    try {
      const result = await moveToTrash(id, inboxNumber);

      if (result.success) {
        toast.success("Email moved to trash");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to move email to trash");
      }
    } catch (error) {
      console.error("Error moving email to trash:", error);
      toast.error("Something went wrong when moving to trash");
    } finally {
      setIsLoading((prev) => ({ ...prev, trash: false }));
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
  const handleMarkAsUnread = async (id: string) => {
    if (!id) return;

    setIsLoading((prev) => ({ ...prev, markUnread: true }));

    try {
      const result = await markAsUnread(id, inboxNumber);

      if (result.success) {
        toast.success("Email marked as unread");
        router.refresh(); // Refresh the UI to update the email list
      } else {
        toast.error(result.error || "Failed to mark email as unread");
      }
    } catch (error) {
      console.error("Error marking email as unread:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading((prev) => ({ ...prev, markUnread: false }));
    }
  };

  // Handler for starring a thread
  const handleStarThread = async (id: string) => {
    if (!id) return;

    setIsLoading((prev) => ({ ...prev, star: true }));

    try {
      const result = await toggleEmailFlag(id, true, inboxNumber);

      if (result.success) {
        toast.success("Email starred");
        router.refresh(); // Refresh the UI to update the email list
      } else {
        toast.error(result.error || "Failed to star email");
      }
    } catch (error) {
      console.error("Error starring email:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading((prev) => ({ ...prev, star: false }));
    }
  };
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64String = reader.result.toString().split(",")[1];
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Add this function to your component
  // Improved sanitizeEmailContent function
  // Improved sanitizeEmailContent function with responsive handling
  const sanitizeEmailContent = (htmlContent: string): string => {
    if (!htmlContent) return "";

    try {
      // First, remove any data attributes from body tags
      let sanitized = htmlContent.replace(
        /<body([^>]*)>/g,
        (match, attributes) => {
          // Strip out any data-* attributes including data-gr-* and data-new-gr-*
          const cleanedAttributes = attributes.replace(
            /\s+data-[\w\-]+="[^"]*"/g,
            ""
          );
          return `<body${cleanedAttributes}>`;
        }
      );

      // Next, handle inline attributes anywhere in the document
      sanitized = sanitized.replace(
        /\s+data-(new-gr-c-s-check-loaded|gr-ext-installed|cke-saved-src|mce-src)="[^"]*"/g,
        ""
      );

      // Remove other known problematic attributes
      sanitized = sanitized.replace(/\s+data-gramm="[^"]*"/g, "");
      sanitized = sanitized.replace(/\s+data-gramm_editor="[^"]*"/g, "");
      sanitized = sanitized.replace(/\s+data-enable-grammarly="[^"]*"/g, "");

      // Remove Microsoft Office namespace attributes
      sanitized = sanitized.replace(/\s+xmlns:o="[^"]*"/g, "");
      sanitized = sanitized.replace(/\s+xmlns:w="[^"]*"/g, "");
      sanitized = sanitized.replace(/\s+xmlns:m="[^"]*"/g, "");
      sanitized = sanitized.replace(/\s+xmlns:v="[^"]*"/g, "");

      // Fix tables with fixed widths to make them responsive
      sanitized = sanitized.replace(
        /<table([^>]*)width="([^"]*)"([^>]*)>/g,
        '<table$1style="width: 100%; max-width: $2;"$3>'
      );

      // Add max-width to images to prevent them from overflowing
      sanitized = sanitized.replace(/<img([^>]*)>/g, (match, attributes) => {
        // Check if the image already has a style attribute
        if (attributes.includes('style="')) {
          // Add max-width to existing style
          return match.replace(
            /style="([^"]*)"/g,
            'style="$1; max-width: 100%; height: auto;"'
          );
        } else {
          // Add style attribute if it doesn't exist
          return `<img${attributes} style="max-width: 100%; height: auto;">`;
        }
      });

      // Add responsive wrapper around the content
      sanitized = `
      <div class="email-content-wrapper" style="width: 100%; overflow-x: auto;">
        ${sanitized}
      </div>
    `;

      // Add responsive meta tag if the content includes a <head> tag
      if (sanitized.includes("<head>")) {
        sanitized = sanitized.replace(
          "<head>",
          '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
        );
      }

      // Then run through sanitize-html to remove potentially dangerous HTML
      sanitized = sanitizeHtml(sanitized, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
          "img",
          "style",
          "font",
          "div",
          "span",
          "br",
          "p",
          "table",
          "tr",
          "td",
          "th",
          "thead",
          "tbody",
          "a",
          "ul",
          "ol",
          "li",
          "b",
          "strong",
          "i",
          "em",
          "hr",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "caption",
          "col",
          "colgroup",
          "meta",
        ]),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          "*": ["style", "class", "id", "align", "dir", "lang"],
          img: [
            "src",
            "alt",
            "width",
            "height",
            "style",
            "class",
            "id",
            "loading",
          ],
          a: ["href", "target", "rel", "style", "class", "id"],
          table: [
            "width",
            "border",
            "cellpadding",
            "cellspacing",
            "style",
            "class",
            "id",
          ],
          td: [
            "width",
            "valign",
            "align",
            "style",
            "class",
            "colspan",
            "rowspan",
          ],
          th: [
            "width",
            "valign",
            "align",
            "style",
            "class",
            "colspan",
            "rowspan",
          ],
          meta: ["name", "content"],
        },
        allowedStyles: {
          "*": {
            color: [/.*/],
            "font-size": [/.*/],
            "font-family": [/.*/],
            "background-color": [/.*/],
            "text-align": [/.*/],
            width: [/.*/],
            height: [/.*/],
            "max-width": [/.*/],
            "min-width": [/.*/],
            "max-height": [/.*/],
            "min-height": [/.*/],
            margin: [/.*/],
            "margin-top": [/.*/],
            "margin-bottom": [/.*/],
            "margin-left": [/.*/],
            "margin-right": [/.*/],
            padding: [/.*/],
            "padding-top": [/.*/],
            "padding-bottom": [/.*/],
            "padding-left": [/.*/],
            "padding-right": [/.*/],
            border: [/.*/],
            "border-top": [/.*/],
            "border-bottom": [/.*/],
            "border-left": [/.*/],
            "border-right": [/.*/],
            display: [/.*/],
            "text-decoration": [/.*/],
            "vertical-align": [/.*/],
            overflow: [/.*/],
            "overflow-x": [/.*/],
            "overflow-y": [/.*/],
          },
        },
        // Add CSS to make email more responsive
        transformTags: {
          table: (tagName, attribs) => {
            // Add responsive styles to tables
            let style = attribs.style || "";
            if (!style.includes("max-width")) {
              style += "; max-width: 100%; table-layout: auto;";
            }
            return {
              tagName,
              attribs: {
                ...attribs,
                style,
              },
            };
          },
        },
      });

      // Add additional responsive CSS for mobile screens
      const responsiveStyles = `
      <style>
        * { box-sizing: border-box; }
        body, html { width: 100%; }
        img { max-width: 100% !important; height: auto !important; }
        table { width: 100% !important; max-width: 100% !important; }
        
        @media (max-width: 600px) {
          table, tr, td, th { 
            width: 100% !important;
            display: block !important;
          }
        }
        
        /* Make content fit container when resizing */
        .email-content-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
      </style>
    `;

      // Add the styles to the beginning of the content
      sanitized = responsiveStyles + sanitized;

      return sanitized;
    } catch (error) {
      console.error("Error sanitizing email content:", error);
      // Return a plain text version as fallback
      return htmlContent.replace(/<[^>]*>/g, " ");
    }
  };
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail || isLoading.archive}
                onClick={() => mail?.id && handleArchive(mail.id)}
              >
                {isLoading.archive ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail || isLoading.junk}
                onClick={() => mail?.id && handleMoveToJunk(mail.id)}
              >
                {isLoading.junk ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <ArchiveX className="h-4 w-4" />
                )}
                <span className="sr-only">Move to junk</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to junk</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail || isLoading.trash}
                onClick={() => mail?.id && handleMoveToTrash(mail.id)}
              >
                {isLoading.trash ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Reply className="h-4 w-4" />
                <span className="sr-only">Reply</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <ReplyAll className="h-4 w-4" />
                <span className="sr-only">Reply all</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply all</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail}>
                <Forward className="h-4 w-4" />
                <span className="sr-only">Forward</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Forward</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={isLoading.markUnread}
              onClick={() => mail?.id && handleMarkAsUnread(mail.id)}
            >
              {isLoading.markUnread ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <div className="mr-2 h-4 w-4 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
              )}
              Mark as unread
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLoading.star}
              onClick={() => mail?.id && handleStarThread(mail.id)}
            >
              {isLoading.star ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
              )}
              Star thread
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.from.emailAddress.name} />
                <AvatarFallback>
                  {mail.from.emailAddress.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">
                  {mail.from.emailAddress.name}
                </div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">From:</span>{" "}
                  {mail.from.emailAddress.address}
                </div>
              </div>
            </div>
            {mail.receivedDateTime && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.receivedDateTime), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          {/* Email content */}

          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 p-4 text-sm">
              {mail.body.contentType === "html" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: mail.body.content
                      ? sanitizeEmailContent(mail.body.content)
                      : "",
                  }}
                  className="prose max-w-full w-full prose-img:max-w-full prose-img:h-auto email-body-container"
                />
              ) : (
                <div className="whitespace-pre-wrap w-full">
                  {mail.body.content}
                </div>
              )}
            </div>
          </div>
          {/* Attachments section */}
          {mail.attachments && mail.attachments.length > 0 && (
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
                      <span className="max-w-[200px] truncate">
                        {attachment.name}
                      </span>
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
          )}
          <Separator className="mt-auto" />
          {/* Reply section */}
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  ref={textareaRef}
                  className="p-4"
                  placeholder={`Reply to ${mail.from.emailAddress.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                {/* File attachments */}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 pb-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                      >
                        <Paperclip className="size-4" />
                        <span className="max-w-[120px] truncate">
                          {file.name}
                        </span>
                        <Button
                          onClick={() => handleRemoveFile(index)}
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
                )}

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
                    onClick={async (e) => {
                      e.preventDefault();
                      if (replyText.trim()) {
                        try {
                          // Set loading state
                          setIsLoading((prev) => ({ ...prev, sending: true }));

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
                                  "@odata.type":
                                    "#microsoft.graph.fileAttachment",
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
                          toast.error(
                            "An error occurred while sending the reply"
                          );
                        } finally {
                          setIsLoading((prev) => ({ ...prev, sending: false }));
                        }
                      } else {
                        toast.error("Please enter a reply first");
                      }
                    }}
                    size="sm"
                    className="ml-auto"
                    disabled={isLoading.sending}
                  >
                    {isLoading.sending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    ) : (
                      "Send"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
