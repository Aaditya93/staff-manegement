"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
// Re-enable Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReport } from "@/actions/travel-agent/report";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  complaintType: z.enum(["service", "product", "staff", "billing", "other"]),
});

type FormValues = z.infer<typeof formSchema>;

interface ReportComplaintProps {
  ticketId: string;
}

interface ReportComplaintProps {
  ticketId: string;
  travelAgent?: string;
  sales?: string;
  reservation?: string;
}

export default function ReportComplaint({
  ticketId,
  travelAgent,
  sales,
  reservation,
}: ReportComplaintProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      complaintType: "service",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Include the additional props directly in the submission
      const submissionData = {
        ...data,
        ticketId,
        travelAgent,
        sales,
        reservation,
      };

      // Send the data to our server action
      const result = await createReport(submissionData);

      if (result.success) {
        toast.success("Report submitted successfully");
        setOpen(false); // Close dialog on successful submit
        form.reset();
      } else {
        toast.error(result.message || "Failed to submit report");
        if (result) {
          // Handle field-specific errors if needed
          result.errors.forEach((err) => console.error(err));
        }
      }
    } catch (error) {
      toast.error("Failed to submit report. Please try again.");
      console.error("Error submitting report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Report Issue</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
          <DialogDescription>
            Report any issues related to your ticket. We&apos;ll address your
            concerns as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* Remove the outer border/padding class, DialogContent handles spacing */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Removed h3/p description as DialogHeader provides it */}

            {/* Form Fields - Revert to standard {...field} */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief title of the issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="complaintType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complaint Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complaint type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="service">Service Issue</SelectItem>
                      <SelectItem value="product">Product Issue</SelectItem>
                      <SelectItem value="staff">Staff Issue</SelectItem>
                      <SelectItem value="billing">Billing Issue</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide details about the issue"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Use DialogFooter for actions */}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
