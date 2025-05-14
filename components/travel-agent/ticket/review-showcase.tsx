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
      : 0; // Handle case where there are no ratings
  const formattedDate = format(new Date(review.reviewDate), "MMM d, yyyy");

  return (
    <Card className="shadow-sm border-t-2 ">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {" "}
              {/* Increased title size */}
              <FileText className="h-5 w-5 " /> {/* Slightly larger icon */}
              Ticket Review
            </CardTitle>
            <CardDescription className="text-primary-foreground">
              Submitted on {formattedDate}
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {" "}
            {/* Adjusted padding and text size */}
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
                  className="bg-muted/50 p-3 rounded-lg border"
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
                          "h-4 w-4",
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

          {/* Package Quality Section */}
        </div>

        {review.reviewText && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Customer Comments
                </span>
              </div>
              <Alert variant="default" className="bg-background p-3">
                <AlertDescription className="text-sm text-muted-foreground">
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
