import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Building, Calendar, MapPin, Star } from "lucide-react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SlPhone } from "react-icons/sl";
import { Button } from "../ui/button";

// UserProfile interface for the main user details
interface UserProfile {
  name: string;
  role: string;
  position?: string;
  email: string;
  image?: string;
  backgroundImage?: string;
  office?: string;
  emailVerified?: string;
  updatedAt?: string;
  destination?: string[];
  attitude?: number;
  knowledge?: number;
  speed?: number;
  phoneNumber?: string;
  reviewcount?: number;
}

// Review interface based on your Ticket model
interface ReviewData {
  attitude: number;
  knowledge: number;
  speed: number;
  reviewTitle?: string;
  positiveText?: string;
  negativeText?: string;
  userRole?: string;
  reviewDate: Date;
}

// Ticket interface based on your Ticket model
interface TicketWithReview {
  _id: string;
  pax: number;
  companyName: string;
  destination: string;
  travelAgent: {
    id?: string;
    name: string;
    emailId: string;
  };
  createdAt: Date;
  review: ReviewData;
}

// Props interface for the ReviewDashboard component
interface ReviewDashboardProps {
  user: UserProfile;
  reviews?: {
    tickets: TicketWithReview[];
  };
}

// Function to format role string
const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};

export default function ReviewDashboard({
  user,
  reviews,
}: ReviewDashboardProps) {
  // Calculate average ratings from reviews if reviews are provided
  const calculateAverageRating = (
    field: keyof ReviewData
  ): number | undefined => {
    if (!reviews?.tickets || reviews.tickets.length === 0)
      return user[field as keyof UserProfile] as number | undefined;

    const total = reviews.tickets.reduce(
      (sum, ticket) => sum + (ticket.review?.[field] || 0),
      0
    );
    return total / reviews.tickets.length;
  };

  const averageAttitude = calculateAverageRating("attitude");
  const averageKnowledge = calculateAverageRating("knowledge");
  const averageSpeed = calculateAverageRating("speed");
  const reviewCount = reviews?.tickets.length || user.reviewcount || 0;

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full overflow-hidden shadow-lg">
        {/* User Profile Header */}
        <div className="relative">
          {/* Background image section - unchanged */}
          {user.backgroundImage ? (
            <div className="h-32 w-full">
              <Image
                fill
                src={user.backgroundImage}
                alt={`${user.name}'s background`}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
            </div>
          ) : (
            <div className="h-24 bg-muted relative">
              {/* Date Picker positioned in top corner */}
            </div>
          )}

          {/* User profile section - unchanged */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-6 gap-y-4 -mt-20 sm:-mt-24 relative z-10">
              <Avatar className="w-32 h-32 sm:w-36 sm:h-36 border-4 border-background rounded-full shadow-xl shrink-0">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-4xl font-semibold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* User details section - unchanged */}
              <div className="pt-6 sm:pt-12 flex-1 space-y-4 min-w-0">
                {/* User name and title - unchanged */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-x-4 gap-y-2">
                  {/* Unchanged */}
                  <div className="space-y-1">
                    <h2
                      className="text-3xl font-bold text-primary-foreground tracking-tight truncate"
                      title={user.name}
                    >
                      {user.name}
                    </h2>
                    <div className="flex items-center gap-2 text-primary-foreground">
                      <Badge className="text-sm font-medium">
                        {formatRole(user.role)}
                      </Badge>
                      {user.position && (
                        <>
                          <span className="text-sm text-primary-foreground">
                            •
                          </span>
                          <span className="text-sm font-medium">
                            {user.position}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact information - unchanged */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-2 text-sm">
                  {/* Email */}
                  <div className="flex items-center gap-2.5 truncate text-primary-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span
                      className="truncate text-primary-foreground"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                  </div>

                  {/* Office */}
                  {user.office && (
                    <div className="flex items-center gap-2.5 truncate text-primary-foreground">
                      <Building className="h-4 w-4 text-primary-foreground shrink-0" />
                      <span
                        className="text-primary-foreground truncate"
                        title={user.office}
                      >
                        {user.office}
                      </span>
                    </div>
                  )}

                  {/* Email Verification Date */}
                  {true && (
                    <div className="flex items-center gap-2.5 text-primary-foreground ">
                      <SlPhone className="h-4 w-4 text-primary-foreground shrink-0" />
                      <span>
                        {" "}
                        <span className=" font-medium">
                          {user.phoneNumber || "N/A"}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Last Updated */}
                  {user.updatedAt && (
                    <div className="flex items-center gap-2.5 text-primary-foreground ">
                      <Calendar className="h-4 w-4 text-background shrink-0" />
                      <span>
                        Last updated:{" "}
                        <span className=" font-medium text-background">
                          {format(new Date(user.updatedAt), "MMM dd, yyyy")}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Destination Expertise */}
                {user.destination && user.destination.length > 0 && (
                  <div className="pt-3">
                    <h3 className="text-xs font-semibold uppercase text-primary-foreground tracking-wider mb-2 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary-foreground" />
                      Destination Expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {user.destination.map((dest, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="font-medium px-2.5 py-1"
                        >
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Ratings Section */}
        {(averageAttitude || averageKnowledge || averageSpeed) && (
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-3 md:mb-0">
                <h3 className="text-lg font-semibold text-gray-800">
                  Performance Ratings
                </h3>
                <p className="text-sm text-gray-600">
                  Based on {reviewCount} customer reviews
                </p>

                {/* Combined Average Rating */}
                {averageAttitude && averageKnowledge && averageSpeed && (
                  <div className="mt-2 pl-0 flex items-center">
                    <div className="flex items-center bg-indigo-100 px-3 py-1 rounded-full">
                      <span className="text-indigo-700 font-bold mr-1.5">
                        {(
                          (averageAttitude + averageKnowledge + averageSpeed) /
                          3
                        ).toFixed(1)}
                      </span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const avgRating =
                            (averageAttitude +
                              averageKnowledge +
                              averageSpeed) /
                            3;
                          return (
                            <span key={`avg-${i}`}>
                              {i < Math.floor(avgRating) ? (
                                <span className="text-amber-400">★</span>
                              ) : i < avgRating ? (
                                <span className="text-amber-400">★</span>
                              ) : (
                                <span className="text-gray-300">★</span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                      <span className="ml-2 text-xs font-medium text-indigo-700">
                        Overall Rating
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                {averageAttitude && (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {averageAttitude.toFixed(1)}
                    </div>
                    <div className="flex my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={`att-${i}`}>
                          {i < Math.floor(averageAttitude) ? (
                            <span className="text-amber-400">★</span>
                          ) : i < averageAttitude ? (
                            <span className="text-amber-400">★</span>
                          ) : (
                            <span className="text-gray-300">★</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Attitude
                    </span>
                  </div>
                )}

                {averageKnowledge && (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {averageKnowledge.toFixed(1)}
                    </div>
                    <div className="flex my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={`know-${i}`}>
                          {i < Math.floor(averageKnowledge) ? (
                            <span className="text-amber-400">★</span>
                          ) : i < averageKnowledge ? (
                            <span className="text-amber-400">★</span>
                          ) : (
                            <span className="text-gray-300">★</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Knowledge
                    </span>
                  </div>
                )}
                {averageSpeed && (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {averageSpeed.toFixed(1)}
                    </div>
                    <div className="flex my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={`speed-${i}`}>
                          {i < Math.floor(averageSpeed) ? (
                            <span className="text-amber-400">★</span>
                          ) : i < averageSpeed ? (
                            <span className="text-amber-400">★</span>
                          ) : (
                            <span className="text-gray-300">★</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Response Speed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* List of Review Tickets */}
        {reviews?.tickets && reviews.tickets.length > 0 && (
          <div className="p-6 bg-muted/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Recent Reviews
                <Badge variant="outline" className="ml-2 text-xs">
                  {reviews.tickets.length}
                </Badge>
              </h3>
            </div>

            <div className="space-y-4">
              {reviews.tickets.map((ticket) => (
                <Card key={ticket._id}>
                  <CardHeader className="pb-2 pt-2">
                    <div className="flex justify-between">
                      <div>
                        {ticket.review.reviewTitle && (
                          <CardTitle className="text-md font-medium">
                            {ticket.review.reviewTitle}
                          </CardTitle>
                        )}
                        <CardDescription className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-primary">
                            {ticket.destination}
                          </span>{" "}
                          •
                          <span>
                            {ticket.pax}{" "}
                            {ticket.pax === 1 ? "traveler" : "travelers"}
                          </span>{" "}
                          •
                          <span>
                            {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                          </span>
                        </CardDescription>
                      </div>

                      <div className="flex items-center rounded-full bg-primary/10 px-2 py-1">
                        <Star className="h-3.5 w-3.5 fill-primary text-primary mr-1" />
                        <span className="text-xs font-bold text-primary">
                          {(
                            (ticket.review.attitude +
                              ticket.review.knowledge +
                              ticket.review.speed) /
                            3
                          ).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <Separator />

                  <CardContent className="py-3 space-y-3">
                    {/* Rating display with stars below headings */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="mb-1">
                          <span className="text-muted-foreground">
                            Attitude
                          </span>{" "}
                          <span className="font-medium ml-1">
                            {ticket.review.attitude.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={`att-${i}`}
                              className={`h-3 w-3 ${
                                i < Math.floor(ticket.review.attitude)
                                  ? "fill-amber-400 text-amber-400"
                                  : i < ticket.review.attitude
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="mb-1">
                          <span className="text-muted-foreground">
                            Knowledge
                          </span>{" "}
                          <span className="font-medium ml-1">
                            {ticket.review.knowledge.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={`know-${i}`}
                              className={`h-3 w-3 ${
                                i < Math.floor(ticket.review.knowledge)
                                  ? "fill-amber-400 text-amber-400"
                                  : i < ticket.review.knowledge
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="mb-1">
                          <span className="text-muted-foreground">Speed</span>{" "}
                          <span className="font-medium ml-1">
                            {ticket.review.speed.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={`speed-${i}`}
                              className={`h-3 w-3 ${
                                i < Math.floor(ticket.review.speed)
                                  ? "fill-amber-400 text-amber-400"
                                  : i < ticket.review.speed
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Review feedback */}
                    {(ticket.review.positiveText ||
                      ticket.review.negativeText) && (
                      <div className="text-sm space-y-2">
                        {ticket.review.positiveText && (
                          <div className="pl-2 border-l-2 border-green-500">
                            <p className="text-muted-foreground text-xs mb-1">
                              What went well:
                            </p>
                            <p>{ticket.review.positiveText}</p>
                          </div>
                        )}

                        {ticket.review.negativeText && (
                          <div className="pl-2 border-l-2 border-amber-500">
                            <p className="text-muted-foreground text-xs mb-1">
                              Areas for improvement:
                            </p>
                            <p>{ticket.review.negativeText}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="text-xs text-muted-foreground pt-0 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {ticket.travelAgent.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>Reviewed by {ticket.travelAgent.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.review.reviewDate && (
                        <span className="text-xs">
                          {format(
                            new Date(ticket.review.reviewDate),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      )}

                      {/* Added button to go to ticket */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 text-xs h-7"
                        asChild
                      >
                        <Link
                          href={`/ticket/${ticket._id}`}
                          className="text-primary"
                        >
                          View Ticket
                        </Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
        {/* Button to view all reviews */}
      </Card>
    </div>
  );
}
