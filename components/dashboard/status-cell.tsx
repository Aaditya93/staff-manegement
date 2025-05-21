"use client";

import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { updateTicketStatus } from "@/actions/tickets/edit-ticket";
type StatusCellProps = {
  defaultStatus: string;
  ticketId: string;
};

type FormValues = {
  status: string;
};

export function StatusCell({ defaultStatus, ticketId }: StatusCellProps) {
  // Create a form to handle status updates
  const form = useForm<FormValues>({
    defaultValues: {
      status: defaultStatus,
    },
  });

  // Handle status change
  const onStatusChange = async (newStatus: string) => {
    try {
      await updateTicketStatus({
        ticketId: ticketId,
        status: newStatus,
      });
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  return (
    <div className="relative">
      <div>
        <FormProvider {...form}>
          <form>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onStatusChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[120px] h-8 text-center">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="quote_sent">Quote Sent</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
