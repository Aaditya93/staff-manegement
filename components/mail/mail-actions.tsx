import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  markAsUnread,
  toggleEmailFlag,
  moveToArchive,
  moveToJunk,
  moveToTrash,
} from "@/actions/mail/email-actions";
export function useMailActions(inboxNumber: number) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const router = useRouter();

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

  const handleMarkAsUnread = async (id: string) => {
    if (!id) return;
    setIsLoading((prev) => ({ ...prev, markUnread: true }));

    try {
      const result = await markAsUnread(id, inboxNumber);
      if (result.success) {
        toast.success("Email marked as unread");
        router.refresh();
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

  const handleStarThread = async (id: string) => {
    if (!id) return;
    setIsLoading((prev) => ({ ...prev, star: true }));

    try {
      const result = await toggleEmailFlag(id, true, inboxNumber);
      if (result.success) {
        toast.success("Email starred");
        router.refresh();
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

  return {
    isLoading,
    handleArchive,
    handleMoveToJunk,
    handleMoveToTrash,
    handleMarkAsUnread,
    handleStarThread,
  };
}
