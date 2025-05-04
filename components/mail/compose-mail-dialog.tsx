"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Paperclip, Minimize2, Maximize2, X, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { EmojiPickerPopover } from "./emojis";
import { sendEmail } from "@/actions/mail/send-email";
import { Badge } from "../ui/badge";
import { fileToBase64 } from "@/utils/sanitize-email";
interface ComposeMailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inboxNumber: number;
}

export function ComposeMailDialog({
  open,
  onOpenChange,
  inboxNumber,
}: ComposeMailDialogProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const ccInputRef = useRef<HTMLInputElement>(null);
  const bccInputRef = useRef<HTMLInputElement>(null);

  // Store parsed emails as arrays for badge display
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);

  // ...existing code...

  const handleToInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTo(value);

    // Check if the input ends with comma or semicolon
    if (value.endsWith(",") || value.endsWith(";")) {
      const email = value.slice(0, -1).trim();
      if (email) {
        setToEmails((prev) => [...prev, email]);
        setTo("");
      }
    } else {
      // Only store in temporary state, don't update badges yet
      setTo(value);
    }
  };

  const handleCcInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCc(value);

    // Check if the input ends with comma or semicolon
    if (value.endsWith(",") || value.endsWith(";")) {
      const email = value.slice(0, -1).trim();
      if (email) {
        setCcEmails((prev) => [...prev, email]);
        setCc("");
      }
    } else {
      // Only store in temporary state, don't update badges yet
      setCc(value);
    }
  };

  const handleBccInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBcc(value);

    // Check if the input ends with comma or semicolon
    if (value.endsWith(",") || value.endsWith(";")) {
      const email = value.slice(0, -1).trim();
      if (email) {
        setBccEmails((prev) => [...prev, email]);
        setBcc("");
      }
    } else {
      // Only store in temporary state, don't update badges yet
      setBcc(value);
    }
  };

  // Improved key handling for To field
  const handleToKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      const email = to.trim();
      if (email) {
        setToEmails((prev) => [...prev, email]);
        setTo("");
      }
    } else if (e.key === "Backspace" && to === "" && toEmails.length > 0) {
      // Remove the last email badge when backspace is pressed on empty input
      const newEmails = [...toEmails];
      newEmails.pop();
      setToEmails(newEmails);
    }
  };

  // Improved key handling for Cc field
  const handleCcKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      const email = cc.trim();
      if (email) {
        setCcEmails((prev) => [...prev, email]);
        setCc("");
      }
    } else if (e.key === "Backspace" && cc === "" && ccEmails.length > 0) {
      // Remove the last email badge when backspace is pressed on empty input
      const newEmails = [...ccEmails];
      newEmails.pop();
      setCcEmails(newEmails);
    }
  };

  // Improved key handling for Bcc field
  const handleBccKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      const email = bcc.trim();
      if (email) {
        setBccEmails((prev) => [...prev, email]);
        setBcc("");
      }
    } else if (e.key === "Backspace" && bcc === "" && bccEmails.length > 0) {
      // Remove the last email badge when backspace is pressed on empty input
      const newEmails = [...bccEmails];
      newEmails.pop();
      setBccEmails(newEmails);
    }
  };

  // ...existing code...

  const handleReset = () => {
    setSubject("");
    setBody("");
    setTo("");
    setCc("");
    setBcc("");
    setToEmails([]);
    setCcEmails([]);
    setBccEmails([]);
    setFiles([]);
    setShowCc(false);
    setShowBcc(false);
    setIsMinimized(false);
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

  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Insert emoji at cursor position
    const newText = body.substring(0, start) + emoji + body.substring(end);

    setBody(newText);

    // After state update, set the cursor position after the inserted emoji
    setTimeout(() => {
      const newCursorPos = start + emoji.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const removeEmail = (type: "to" | "cc" | "bcc", index: number) => {
    if (type === "to") {
      const newEmails = [...toEmails];
      newEmails.splice(index, 1);
      setToEmails(newEmails);
      setTo(newEmails.join(", "));
    } else if (type === "cc") {
      const newEmails = [...ccEmails];
      newEmails.splice(index, 1);
      setCcEmails(newEmails);
      setCc(newEmails.join(", "));
    } else if (type === "bcc") {
      const newEmails = [...bccEmails];
      newEmails.splice(index, 1);
      setBccEmails(newEmails);
      setBcc(newEmails.join(", "));
    }
  };

  const handleSendEmail = async () => {
    // Check if there are any recipients (either in the input or as badges)
    if (to.trim() === "" && toEmails.length === 0) {
      toast.error("Please enter at least one recipient");
      return;
    }

    // Consider both badges and current input for validation
    const allToEmails = [...toEmails];
    if (to.trim()) {
      allToEmails.push(to.trim());
    }

    const allCcEmails = [...ccEmails];
    if (cc.trim()) {
      allCcEmails.push(cc.trim());
    }

    const allBccEmails = [...bccEmails];
    if (bcc.trim()) {
      allBccEmails.push(bcc.trim());
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const invalidToEmails = allToEmails.filter(
      (email) => !emailRegex.test(email)
    );
    const invalidCcEmails = allCcEmails.filter(
      (email) => !emailRegex.test(email)
    );
    const invalidBccEmails = allBccEmails.filter(
      (email) => !emailRegex.test(email)
    );

    const allInvalidEmails = [
      ...invalidToEmails,
      ...invalidCcEmails,
      ...invalidBccEmails,
    ];

    if (allInvalidEmails.length > 0) {
      toast.error(`Invalid email address: ${allInvalidEmails.join(", ")}`);
      return;
    }

    try {
      setIsLoading(true);

      // Prepare attachments if any
      let emailAttachments = [];
      if (files.length > 0) {
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

      // Prepare email data - use the badge arrays plus any content in input fields
      const emailData = {
        subject: subject || "(No subject)",
        body: body,
        toRecipients: allToEmails,
        ccRecipients: allCcEmails,
        bccRecipients: allBccEmails,
        inboxNumber: inboxNumber,
        attachments: emailAttachments,
      };

      // Send the email
      const result = await sendEmail(emailData);

      if (result.success) {
        toast.success("Email sent successfully");
        handleReset();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("An error occurred while sending the email");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDialogContent = () => (
    <>
      <DialogHeader className="border-b px-4 py-2">
        <DialogTitle className="text-sm font-medium">New Message</DialogTitle>
        <div className="absolute right-4 top-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      {!isMinimized && (
        <div className="flex flex-col">
          <div className="border-b p-4">
            <div className="space-y-3">
              {/* To Recipients */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="w-10 text-xs font-medium text-muted-foreground">
                    To
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 items-center">
                      {toEmails.map((email, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="rounded-full flex items-center gap-1 py-0 pl-2 pr-1 text-xs"
                        >
                          {email}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
                            onClick={() => removeEmail("to", index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Input
                        ref={toInputRef}
                        placeholder={toEmails.length === 0 ? "Recipients" : ""}
                        className="flex-1 min-w-[100px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm"
                        value={to}
                        onChange={handleToInputChange}
                        onKeyDown={handleToKeyDown}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {!showCc && !showBcc && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6"
                        onClick={() => setShowCc(true)}
                      >
                        Cc
                      </Button>
                    )}
                    {!showBcc && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-6"
                        onClick={() => setShowBcc(true)}
                      >
                        Bcc
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* CC Recipients */}
              {showCc && (
                <div className="flex items-center">
                  <div className="w-10 text-xs font-medium text-muted-foreground">
                    Cc
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 items-center">
                      {ccEmails.map((email, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="rounded-full flex items-center gap-1 py-0 pl-2 pr-1 text-xs"
                        >
                          {email}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
                            onClick={() => removeEmail("cc", index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Input
                        ref={ccInputRef}
                        placeholder={
                          ccEmails.length === 0 ? "Carbon copy recipients" : ""
                        }
                        className="flex-1 min-w-[100px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm"
                        value={cc}
                        onChange={handleCcInputChange}
                        onKeyDown={handleCcKeyDown}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowCc(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* BCC Recipients */}
              {showBcc && (
                <div className="flex items-center">
                  <div className="w-10 text-xs font-medium text-muted-foreground">
                    Bcc
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 items-center">
                      {bccEmails.map((email, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="rounded-full flex items-center gap-1 py-0 pl-2 pr-1 text-xs"
                        >
                          {email}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
                            onClick={() => removeEmail("bcc", index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                      <Input
                        ref={bccInputRef}
                        placeholder={
                          bccEmails.length === 0
                            ? "Blind carbon copy recipients"
                            : ""
                        }
                        className="flex-1 min-w-[100px] border-0 p-0 shadow-none focus-visible:ring-0 text-sm"
                        value={bcc}
                        onChange={handleBccInputChange}
                        onKeyDown={handleBccKeyDown}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowBcc(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex items-center">
                <Input
                  placeholder="Subject"
                  className="flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <Textarea
              ref={textareaRef}
              placeholder="Write your message here..."
              className="min-h-[200px] border-0 p-0 shadow-none focus-visible:ring-0"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {files.length > 0 && (
            <div className="border-t px-4 py-2">
              <p className="mb-2 text-xs font-medium">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="bg-secondary flex items-center gap-2 rounded-lg px-3 py-1 text-xs"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <Button
                      onClick={() => handleRemoveFile(index)}
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full p-0 opacity-70 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto border-t px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  onClick={handleSendEmail}
                  size="sm"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent pb-4" />
                  ) : (
                    <>
                      <Send className="mr-2 h-3 w-3" />
                      Send
                    </>
                  )}
                </Button>

                <div className="flex items-center">
                  <EmojiPickerPopover onEmojiSelect={handleEmojiSelect} />

                  <Label
                    htmlFor="file-upload-compose"
                    className="hover:bg-secondary-foreground/10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload-compose"
                      ref={uploadInputRef}
                    />
                    <Paperclip className="h-4 w-4" />
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        className={`${
          isMinimized ? "max-h-14" : "max-h-[80vh]"
        } p-0 rounded-lg border shadow-lg gap-0 overflow-hidden transition-all duration-200 !fixed !bottom-6 !right-6 !top-auto !translate-x-0 !translate-y-0`}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          top: "auto",
          left: "auto",
          transform: "none",
          height: isMinimized ? "auto" : "500px",
          width: "500px",
          maxWidth: "95vw",
          zIndex: 9999,
          margin: 0,
        }}
      >
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
