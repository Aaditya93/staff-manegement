import React from "react";
import { format } from "date-fns";
import { Star, FileText, MessageSquare } from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert"; // Ensure Alert components are imported

interface ReviewShowcaseProps {
  review: {
    attitude: number;
    knowledge: number;
    services: number;
    speed: number;
    hotel: number;
    guide: number;
    transfer: number;
    meal: number;
    reviewText?: string;
    reviewDate: string;
    _id: string;
  };
}

const ReviewShowcase: React.FC<ReviewShowcaseProps> = ({ review }) => {
  // Define rating categories and calculate average
  const ratingCategories = [
    { name: "Attitude", value: review.attitude },
    { name: "Knowledge", value: review.knowledge },
    { name: "Services", value: review.services },
    { name: "Speed", value: review.speed },
    { name: "Hotel", value: review.hotel },
    { name: "Guide", value: review.guide },
    { name: "Transfer", value: review.transfer },
    { name: "Meal", value: review.meal },
  ];

  const ratingValues = ratingCategories.map((cat) => cat.value);
  const averageRating =
    ratingValues.length > 0
      ? ratingValues.reduce((sum, rating) => sum + rating, 0) /
        ratingValues.length
      : 0; // Handle case where there are no ratings
  const formattedDate = format(new Date(review.reviewDate), "MMM d, yyyy");

  return (
    <Card className="shadow-sm border-t-2 border-t-amber-400 ">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {" "}
              {/* Increased title size */}
              <FileText className="h-5 w-5 text-amber-500" />{" "}
              {/* Slightly larger icon */}
              Ticket Review
            </CardTitle>
            <CardDescription className="text-primary-foreground">
              Submitted on {formattedDate}
            </CardDescription>
          </div>
          <Badge variant="default" className="px-2.5 py-1 bg-amber-500">
            {" "}
            {/* Adjusted padding and text size */}
            {averageRating.toFixed(1)} / 5
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {" "}
          {/* Increased gap */}
          {ratingCategories.map((category) => (
            <div
              key={category.name}
              className="bg-muted/50 p-3 rounded-lg border"
            >
              {" "}
              {/* Use muted background, larger radius, add border */}
              <div className="flex justify-between items-center mb-1.5">
                {" "}
                {/* Added items-center, increased margin */}
                <span className="text-sm font-medium text-foreground">
                  {category.name}
                </span>{" "}
                {/* Use theme text color */}
                <span className="text-xs font-semibold text-muted-foreground">
                  {category.value}/5
                </span>{" "}
                {/* Smaller text, theme color */}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4", // Slightly larger stars
                      star <= category.value
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30" // Use muted foreground for empty stars
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {review.reviewText && (
          <>
            <Separator className="my-4" /> {/* Increased margin */}
            <div className="space-y-2">
              {" "}
              {/* Added space-y for better spacing */}
              <div className="flex items-center gap-2">
                {" "}
                {/* Removed mb-2, handled by space-y */}
                <MessageSquare className="h-4 w-4 text-muted-foreground" />{" "}
                {/* Use theme color */}
                <span className="text-sm font-medium text-foreground">
                  Customer Comments
                </span>{" "}
                {/* Use theme color */}
              </div>
              {/* Use Alert for comments section */}
              <Alert variant="default" className="bg-background p-3">
                {" "}
                {/* Use outline variant, theme background and padding */}
                <AlertDescription className="text-sm text-muted-foreground">
                  {" "}
                  {/* Use theme color */}
                  {review.reviewText}
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewShowcase;
