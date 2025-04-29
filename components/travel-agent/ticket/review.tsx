"use client";
import React, { useState } from "react";
import { ClipboardEdit, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { submitTicketReview } from "@/actions/travel-agent/review";

interface ReviewTicketProps {
  ticketId: string;
  onReviewSubmitted?: () => void;
}

interface ReviewData {
  attitude: number;
  knowledge: number;
  services: number;
  speed: number;
  hotel: number;
  guide: number;
  transfer: number;
  meal: number;
  reviewText: string;
}

const ReviewTicket: React.FC<ReviewTicketProps> = ({
  ticketId,
  onReviewSubmitted,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [reviewData, setReviewData] = useState<ReviewData>({
    attitude: 0,
    knowledge: 0,
    services: 0,
    speed: 0,
    hotel: 0,
    guide: 0,
    transfer: 0,
    meal: 0,
    reviewText: "",
  });

  const handleRatingChange =
    (field: keyof Omit<ReviewData, "reviewText">) => (value: number) => {
      setReviewData({
        ...reviewData,
        [field]: value,
      });
    };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewData({
      ...reviewData,
      reviewText: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const reviewPayload = {
        ...reviewData,
        ticketId,
        reviewDate: new Date(),
      };

      const hasRating = Object.entries(reviewData).some(
        ([key, value]) => key !== "reviewText" && value > 0
      );

      if (!hasRating) {
        toast.error("Please provide at least one rating before submitting");
        setLoading(false);
        return;
      }

      const response = await submitTicketReview({
        ...reviewData,
        ticketId,
      });

      toast.success("Review submitted successfully");

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      setOpen(false);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const ratingFields = [
    { name: "attitude", label: "Attitude" },
    { name: "knowledge", label: "Knowledge" },
    { name: "services", label: "Services" },
    { name: "speed", label: "Speed" },
    { name: "hotel", label: "Hotel" },
    { name: "guide", label: "Guide" },
    { name: "transfer", label: "Transfer" },
    { name: "meal", label: "Meal" },
  ];

  const StarRating = ({
    name,
    label,
    value,
    onChange,
  }: {
    name: keyof Omit<ReviewData, "reviewText">;
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <span className="text-sm font-medium">
          {value > 0 ? `${value}/5` : "Not rated"}
        </span>
      </div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => onChange(rating)}
            aria-label={`Rate ${rating} stars`}
          >
            <Star
              className={cn(
                "h-6 w-6 transition-all",
                rating <= value ? "text-amber-400" : "text-gray-200",
                rating <= value ? "fill-amber-400" : "fill-none"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <ClipboardEdit className="h-4 w-4" />
          Add Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Submit Ticket Review</DialogTitle>
          <DialogDescription>
            Please rate your experience from 1 (poor) to 5 (excellent).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {ratingFields.map((field) => (
            <Card
              key={field.name}
              className="border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <StarRating
                  name={field.name as keyof Omit<ReviewData, "reviewText">}
                  label={field.label}
                  value={
                    reviewData[
                      field.name as keyof Omit<ReviewData, "reviewText">
                    ]
                  }
                  onChange={handleRatingChange(
                    field.name as keyof Omit<ReviewData, "reviewText">
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <Label htmlFor="review-text" className="text-sm font-medium">
            Additional Comments
          </Label>
          <Textarea
            id="review-text"
            placeholder="Please share your feedback about this experience..."
            value={reviewData.reviewText}
            onChange={handleTextChange}
            className="min-h-[120px] resize-none"
          />
        </div>

        <DialogFooter className="pt-4">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewTicket;
