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
import { sendEmail } from "@/actions/mail/mail";
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
import { Mail } from "./data";
import { moveToArchive, moveToJunk, moveToTrash } from "@/actions/mail/mail";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EmojiPickerPopover } from "./emojis";
import { Label } from "../ui/label";

interface MailDisplayProps {
  mail: Mail | null;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
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
  const handleArchive = async (id: string) => {
    if (!id) return;

    setIsLoading((prev) => ({ ...prev, archive: true }));

    try {
      const result = await moveToArchive(id);

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
      const result = await moveToJunk(id);

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
      const result = await moveToTrash(id);

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
      const result = await markAsUnread(id);

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
      const result = await toggleEmailFlag(id, true);

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

  return (
    <div className="flex h-full flex-col">
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
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(mail.date), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          <div className="flex-1 whitespace-pre-wrap p-4 text-sm">
            {mail.text}
          </div>
          <Separator className="mt-auto" />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea
                  ref={textareaRef}
                  className="p-4"
                  placeholder={`Reply to ${mail.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
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
                          // Define interface for email attachments
                          interface EmailAttachment {
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
                            body: replyText,
                            toRecipients: [mail?.email || ""],
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
