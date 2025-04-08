import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { Archive, ArchiveX, Forward, MoreVertical, Star, Trash2 } from "lucide-react";
import { EmailMessage } from "./mail-display";
import { useMailActions } from "./mail-actions";

interface MailHeaderProps {
  mail: EmailMessage | null;
  inboxNumber: number;
  onForwardClick: () => void;
}

export function MailHeader({ mail, inboxNumber, onForwardClick }: MailHeaderProps) {
  const { 
    isLoading, 
    handleArchive, 
    handleMoveToJunk, 
    handleMoveToTrash,
    handleMarkAsUnread,
    handleStarThread
  } = useMailActions(inboxNumber);

  return (
    <>
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
              <Button
                variant="ghost"
                size="icon"
                disabled={!mail}
                onClick={onForwardClick}
              >
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
    </>
  );
}
