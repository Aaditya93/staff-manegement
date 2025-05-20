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
import { Input } from "@/components/ui/input";

interface ReviewTicketProps {
  ticketId: string;
  onReviewSubmitted?: () => void;
}

interface ReviewData {
  attitude: number;
  knowledge: number;
  speed: number;
  reviewTitle: string;
  positiveText: string;
  negativeText: string;
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
    speed: 0,
    reviewTitle: "",
    positiveText: "",
    negativeText: "",
  });

  const handleRatingChange =
    (field: keyof Pick<ReviewData, "attitude" | "knowledge" | "speed">) =>
    (value: number) => {
      setReviewData({
        ...reviewData,
        [field]: value,
      });
    };

  const handleTextChange =
    (
      field: keyof Pick<
        ReviewData,
        "reviewTitle" | "positiveText" | "negativeText"
      >
    ) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setReviewData({
        ...reviewData,
        [field]: e.target.value,
      });
    };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Check if all ratings are provided
      if (!reviewData.attitude || !reviewData.knowledge || !reviewData.speed) {
        toast.error("Please provide ratings for all categories");
        setLoading(false);
        return;
      }

      // Check if review title is provided
      if (!reviewData.reviewTitle) {
        toast.error("Please provide a review title");
        setLoading(false);
        return;
      }

      // Check for positive feedback text
      if (!reviewData.positiveText) {
        toast.error("Please provide feedback on what went well");
        setLoading(false);
        return;
      }

      // Check for negative/improvement feedback text
      if (!reviewData.negativeText) {
        toast.error("Please provide feedback on areas for improvement");
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
    // Staff performance review
    { name: "attitude", label: "Attitude", category: "staff" },
    { name: "knowledge", label: "Knowledge", category: "staff" },
    { name: "speed", label: "Speed", category: "staff" },
  ];

  const StarRating = ({
    name,
    label,
    value,
    onChange,
  }: {
    name: keyof Pick<ReviewData, "attitude" | "knowledge" | "speed">;
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="mb-4 text-center">
      <div className="mb-2 flex items-center justify-center text-center">
        <Label className="text-center font-medium" htmlFor={name}>
          {label}
        </Label>
      </div>
      <div className="flex justify-center space-x-1">
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
      <DialogContent
        className="sm:max-w-[900px] md:max-w-[900px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto p-6 w-[90vw]"
        position="center"
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Submit Ticket Review</DialogTitle>
          <DialogDescription>
            Please rate your experience and provide detailed feedback.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Review title input */}
          <div className="space-y-2">
            <Label htmlFor="review-title" className="text-sm font-medium">
              Review Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience in a few words"
              value={reviewData.reviewTitle}
              onChange={handleTextChange("reviewTitle")}
              required
            />
          </div>

          {/* User role selection */}

          {/* Staff Performance Ratings */}
          {/* Staff Performance Ratings */}
          <div>
            <h3 className="text-lg font-medium mb-3">
              Staff Performance <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ratingFields
                .filter((field) => field.category === "staff")
                .map((field) => (
                  <Card
                    key={field.name}
                    className="border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <StarRating
                        name={
                          field.name as keyof Pick<
                            ReviewData,
                            "attitude" | "knowledge" | "speed"
                          >
                        }
                        label={`${field.label} *`}
                        value={
                          reviewData[
                            field.name as keyof Pick<
                              ReviewData,
                              "attitude" | "knowledge" | "speed"
                            >
                          ]
                        }
                        onChange={handleRatingChange(
                          field.name as keyof Pick<
                            ReviewData,
                            "attitude" | "knowledge" | "speed"
                          >
                        )}
                      />
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Detailed feedback section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Detailed Feedback</h3>

            <div className="space-y-2">
              <Label htmlFor="positive-text" className="text-sm font-medium">
                What Went Well <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="positive-text"
                placeholder="Share what you liked about this experience..."
                value={reviewData.positiveText}
                onChange={handleTextChange("positiveText")}
                className="min-h-[100px] resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negative-text" className="text-sm font-medium">
                Areas for Improvement <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="negative-text"
                placeholder="Share what could have been better..."
                value={reviewData.negativeText}
                onChange={handleTextChange("negativeText")}
                className="min-h-[100px] resize-none"
                required
              />
            </div>
          </div>
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
