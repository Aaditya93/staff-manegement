import { toast } from "sonner";
import { format } from "date-fns/format";

import {
  Archive,
  ArchiveX,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";

import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

import { DropdownMenu, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";

import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Mail } from "./data";
import { moveToArchive, moveToJunk, moveToTrash } from "@/actions/mail/mail";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface MailDisplayProps {
  mail: Mail | null;
}

export function MailDisplay({ mail }: MailDisplayProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const router = useRouter();
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
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
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
                  className="p-4"
                  placeholder={`Reply ${mail.name}...`}
                />
                <div className="flex items-center">
                  <Label
                    htmlFor="mute"
                    className="flex items-center gap-2 text-xs font-normal"
                  >
                    <Switch id="mute" aria-label="Mute thread" /> Mute this
                    thread
                  </Label>
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Send
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
