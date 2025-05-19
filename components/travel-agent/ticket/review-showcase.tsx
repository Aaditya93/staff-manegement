import React from "react";
import { format } from "date-fns";
import {
  Star,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReviewShowcaseProps {
  review: {
    attitude: number;
    knowledge: number;
    speed: number;
    services?: number;
    hotel?: number;
    guide?: number;
    transfer?: number;
    meal?: number;
    reviewTitle?: string;
    positiveText?: string;
    negativeText?: string;
    reviewText?: string;
    reviewDate: string | Date;
    _id: string;
  };
}

const ReviewShowcase: React.FC<ReviewShowcaseProps> = ({ review }) => {
  // Define rating categories and calculate average
  const staffRatingCategories = [
    { name: "Attitude", value: review.attitude },
    { name: "Knowledge", value: review.knowledge },
    { name: "Speed", value: review.speed },
  ];

  const ratingCategories = [...staffRatingCategories];

  const ratingValues = ratingCategories.map((cat) => cat.value);
  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce((sum, rating) => sum + rating, 0) /
        ratingValues.length
      : 0;

  const formattedDate =
    typeof review.reviewDate === "string"
      ? format(new Date(review.reviewDate), "MMM d, yyyy")
      : format(review.reviewDate, "MMM d, yyyy");

  return (
    <Card className="shadow-sm border-t-2">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {review.reviewTitle || "Ticket Review"}
            </CardTitle>
            <CardDescription className="text-primary-foreground">
              Submitted on {formattedDate}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="px-3 py-1 text-base font-semibold"
          >
            {averageRating.toFixed(1)} / 5
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Staff Performance Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              Staff Performance
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {staffRatingCategories.map((category) => (
                <div
                  key={category.name}
                  className="bg-muted/50 p-3 rounded-lg border hover:border-primary transition-colors duration-200"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {category.name}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {category.value}/5
                    </span>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4 transition-colors duration-200",
                          star <= category.value
                            ? "text-amber-400 fill-amber-400"
                            : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="space-y-4">
            {(review.positiveText ||
              review.negativeText ||
              review.reviewText) && (
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                Customer Feedback
              </h3>
            )}

            {review.positiveText && (
              <Alert
                variant="default"
                className="bg-green-50 border-green-200 p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-sm font-medium text-green-700">
                    What Went Well
                  </AlertTitle>
                </div>
                <AlertDescription className="text-sm text-green-600 pl-6">
                  {review.positiveText}
                </AlertDescription>
              </Alert>
            )}

            {review.negativeText && (
              <Alert variant="default" className="bg-red-50 border-red-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-sm font-medium text-red-700">
                    Areas for Improvement
                  </AlertTitle>
                </div>
                <AlertDescription className="text-sm text-red-600 pl-6">
                  {review.negativeText}
                </AlertDescription>
              </Alert>
            )}

            {review.reviewText && (
              <Alert variant="default" className="bg-background p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <AlertTitle className="text-sm font-medium text-foreground">
                    Additional Comments
                  </AlertTitle>
                </div>
                <AlertDescription className="text-sm text-muted-foreground pl-6">
                  {review.reviewText}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewShowcase;
