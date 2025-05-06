"use client";

import { Button } from "@/components/ui/button";
import { approveTicket } from "@/actions/approve-ticket/getTickets";
import { useTicketContext } from "./context";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ApproveControlProps {
  ticketId: string;
}

export function ApproveControl({ ticketId }: ApproveControlProps) {
  const [isPending, startTransition] = useTransition();
  const { selectedSalesStaff, estimatedTime } = useTicketContext();
  const router = useRouter();

  const handleApprove = () => {
    if (!selectedSalesStaff) {
      toast("Please select a sales staff");
      return;
    }

    startTransition(async () => {
      try {
        // Use simple objects to avoid potential circular references

        const salesInChargeData = {
          id: selectedSalesStaff.id,
          name: selectedSalesStaff.name,
          emailId: selectedSalesStaff.email,
        };

        const result = await approveTicket(
          ticketId,
          salesInChargeData,
          estimatedTime
        );

        if (!result.success) {
          console.error("Failed to approve ticket:", result.error);
          toast(`Failed to approve: ${result.error}`);
        } else {
          toast("Ticket approved successfully!");
          router.refresh(); // Use router.refresh() instead of window.location.reload()
        }
      } catch (error) {
        console.error("Error approving ticket:", error);
        toast("An error occurred while approving the ticket");
      }
    });
  };

  return (
    <Button
      onClick={handleApprove}
      size="sm"
      disabled={isPending || !selectedSalesStaff}
    >
      {isPending ? (
        <>
          <Loader2 className=" h-4 w-4 animate-spin " />
        </>
      ) : (
        "Approve"
      )}
    </Button>
  );
}
