import { ITicket } from "@/db/models/ticket";
import { Card } from "../ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { MapPin, Building, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "../ui/separator";
// ...existing code...
import Image from "next/image"; // Ensure Next.js Image is imported
import { convertTicketsToChartData } from "../admin-report/data/line-chart-data";
import { convertTicketsToDestinationChartData } from "../admin-report/data/destination-chart-data";
import { MainLineChart } from "../admin-report/line-chart";
import { DestinationBarChart } from "../admin-report/market-bar-chart";
import { processInquiriesToChartData } from "./pie-chart-data";
import { StageBarChart } from "./stage-bar-chart";
import {
  calculateAverageWaitingTime,
  processInquiriesBySpeed,
} from "./speed-chart-data";
import { SpeedHorizontalChart } from "./speed-horizontal-chart";
import DatePickerWithRange from "./date-range";

interface ReportPageProps {
  tickets: ITicket[];
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    office?: string;
    rating?: number;
    position?: string;
    destination?: string[];
    image?: string;
    backgroundImage?: string;
    emailVerified?: string;
    updatedAt?: string;
  };
}

const EmployeeReport = async ({ tickets, user }: ReportPageProps) => {
  // Format role for display
  const formatRole = (role: string) => {
    if (!role) return "";
    return role.replace(/([A-Z])/g, " $1").trim();
  };
  const LineChartData = convertTicketsToChartData(tickets, "receivedDateTime");
  const destinationData = convertTicketsToDestinationChartData(tickets);
  const pieCharData = processInquiriesToChartData(tickets);
  const speedChartData = processInquiriesBySpeed(tickets);
  const waitingTime = calculateAverageWaitingTime(tickets);

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full overflow-hidden shadow-lg">
        {/* User Profile Header */}
        <div className="relative">
          {user.backgroundImage ? (
            <div className="h-32 w-full">
              <Image
                fill
                src={user.backgroundImage}
                alt={`${user.name}'s background`}
                className="object-cover"
                priority // Consider adding priority if this is LCP
              />
              {/* Gradient overlay for better text readability on the image */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
              {/* Date Picker positioned in top corner */}
              <div className="absolute top-2 right-2 z-20">
                <DatePickerWithRange />
              </div>
            </div>
          ) : (
            <div className="h-24 bg-muted relative">
              {/* Date Picker positioned in top corner */}
              <div className="absolute top-2 right-2 z-20">
                <DatePickerWithRange />
              </div>
            </div>
          )}

          <div className="px-6 pb-6 ">
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

              <div className="pt-6 sm:pt-12 flex-1 space-y-4 min-w-0">
                {" "}
                {/* Added min-w-0 for flex child truncation */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-x-4 gap-y-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pt-2 text-sm">
                  <div className="flex items-center gap-2.5 truncate text-primary-foreground">
                    <Mail className="h-4 w-4  shrink-0" />
                    <span
                      className="truncate text-primary-foreground"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                  </div>

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

                  {user.emailVerified && (
                    <div className="flex items-center gap-2.5 text-primary-foreground ">
                      <Calendar className="h-4 w-4 text-primary-foreground shrink-0" />
                      <span>
                        Verified:{" "}
                        <span className=" font-medium">
                          {format(new Date(user.emailVerified), "MMM dd, yyyy")}
                        </span>
                      </span>
                    </div>
                  )}

                  {user.updatedAt && (
                    <div className="flex items-center gap-2.5 text-primary-foreground ">
                      <Calendar className="h-4 w-4 text-background shrink-0" />
                      <span>
                        Last updated:{" "}
                        <span className=" font-medium text-background  ">
                          {format(new Date(user.updatedAt), "MMM dd, yyyy")}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
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
        <Separator />
        <MainLineChart data={LineChartData} />

        <DestinationBarChart data={destinationData} />
        <div className=" flex-col grid grid-cols-2   pt-0">
          <StageBarChart
            chartData={pieCharData.chartData}
            metrics={pieCharData.metrics}
          />
          <SpeedHorizontalChart
            data={speedChartData}
            waitingTime={waitingTime}
          />
        </div>
      </Card>
    </div>
  );
};

export default EmployeeReport;
