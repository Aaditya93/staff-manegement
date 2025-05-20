import React from "react";
import { format } from "date-fns";
import {
  Star,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  BarChart3,
  Award,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

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
  // Define categories
  const staffRatingCategories = [
    {
      name: "Attitude",
      value: review.attitude,
      icon: <ThumbsUp className="h-4 w-4" />,
    },
    {
      name: "Knowledge",
      value: review.knowledge,
      icon: <Award className="h-4 w-4" />,
    },
    {
      name: "Speed",
      value: review.speed,
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  const serviceRatingCategories = [
    {
      name: "Services",
      value: review.services,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: "Hotel",
      value: review.hotel,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: "Guide",
      value: review.guide,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: "Transfer",
      value: review.transfer,
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      name: "Meal",
      value: review.meal,
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ].filter((cat) => cat.value !== undefined);

  // Calculate average rating
  const validRatings = [...staffRatingCategories, ...serviceRatingCategories]
    .map((cat) => cat.value)
    .filter((value): value is number => value !== undefined);

  const averageRating =
    validRatings.length > 0
      ? validRatings.reduce((sum, rating) => sum + rating, 0) /
        validRatings.length
      : 0;

  // Format date
  const formattedDate =
    typeof review.reviewDate === "string"
      ? format(new Date(review.reviewDate), "MMM d, yyyy")
      : format(review.reviewDate, "MMM d, yyyy");

  // Helper function for rating colors
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };

  const renderRatingCard = (category: any) => (
    <div key={category.name} className="bg-muted/30 p-3 rounded-lg border">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium flex items-center gap-1">
          {category.icon} {category.name}
        </span>
        <span className={cn("font-bold", getRatingColor(category.value))}>
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
                : "text-gray-200"
            )}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Card className="shadow-md border">
      {/* Header with title and average rating */}
      <CardHeader className="bg-primary text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {review.reviewTitle || "Customer Feedback"}
            </CardTitle>
            <CardDescription className="text-white/80">
              Submitted on {formattedDate}
            </CardDescription>
          </div>

          <Badge
            variant="secondary"
            className={cn("px-2 py-1 font-bold", getRatingColor(averageRating))}
          >
            {averageRating.toFixed(1)}/5
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        <div className="space-y-5">
          {/* Staff Ratings */}
          <div>
            <h3 className="font-semibold mb-3 border-b pb-1">
              Staff Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {staffRatingCategories.map(renderRatingCard)}
            </div>
          </div>

          {/* Service Ratings */}
          {serviceRatingCategories.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 border-b pb-1">
                Service Ratings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {serviceRatingCategories.map(renderRatingCard)}
              </div>
            </div>
          )}

          {/* Feedback Text */}
          {(review.positiveText ||
            review.negativeText ||
            review.reviewText) && (
            <div>
              <h3 className="font-semibold mb-3 border-b pb-1">
                Customer Feedback
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {review.positiveText && (
                  <Alert className="bg-green-50 border-green-200">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <AlertTitle className="font-medium text-green-700">
                      What Went Well
                    </AlertTitle>
                    <AlertDescription className="text-sm text-green-600">
                      {review.positiveText}
                    </AlertDescription>
                  </Alert>
                )}

                {review.negativeText && (
                  <Alert className="bg-red-50 border-red-200">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    <AlertTitle className="font-medium text-red-700">
                      Areas for Improvement
                    </AlertTitle>
                    <AlertDescription className="text-sm text-red-600">
                      {review.negativeText}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {review.reviewText && (
                <Alert className="bg-blue-50 border-blue-200 mt-4">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="font-medium text-blue-700">
                    Additional Comments
                  </AlertTitle>
                  <AlertDescription className="text-sm text-blue-600">
                    {review.reviewText}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 text-xs text-gray-500 px-5 py-2">
        Review ID: {review._id.substring(0, 8)}...
      </CardFooter>
    </Card>
  );
};

export default ReviewShowcase;
