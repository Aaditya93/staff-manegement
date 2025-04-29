import { format } from "date-fns";

import {
  Calendar,
  Clock,
  DollarSign,
  Mail,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { CiMap } from "react-icons/ci";
import { LuMail } from "react-icons/lu";
import { Badge } from "@/components/ui/badge";

import { FaRegUser } from "react-icons/fa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ITicket } from "@/db/models/ticket";
import EmailShowcase from "./email-showcase";
import ReportComplaint from "../dashboard/report";
import ReviewTicket from "./review";
import ReviewShowcase from "./review-showcase";

export function TicketDashboard({ ticket }: ITicket) {
  // Helper function to format dates
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy");
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "bg-blue-500";
      case "in progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "canceled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Details</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view ticket information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={`${getStatusColor(
              ticket.status
            )} text-white px-3 py-1 text-sm font-medium`}
          >
            {ticket.status.toUpperCase()}
          </Badge>
          <ReportComplaint
            ticketId={ticket._id}
            travelAgent={ticket.travelAgent.id}
            sales={ticket.salesInCharge.id}
            reservation={ticket.reservationInCharge.id}
          />
          {!ticket.review && <ReviewTicket ticketId={ticket._id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-primary pb-2 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary-foreground mb-4">
              <MapPin className="h-5 w-5" />
              Ticket Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Destination
              </span>
              <span className="font-semibold">{ticket.destination}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-primary" />
                Company
              </span>
              <span className="font-semibold">{ticket.companyName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                Arrival
              </span>
              <span className="font-semibold">
                {formatDate(ticket.arrivalDate)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                Departure
              </span>
              <span className="font-semibold">
                {formatDate(ticket.departureDate)}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" />
                PAX
              </span>
              <span className="font-semibold">{ticket.pax}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CiMap className="h-4 w-4 text-primary" />
                Market
              </span>
              <span className="font-semibold">{ticket.market}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4 text-primary" />
                Cost
              </span>
              <span className="font-semibold text-green-600">
                ${ticket.cost.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                Speed
              </span>
              <Badge variant="outline" className="capitalize font-medium">
                {ticket.speed}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-primary pb-2 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary-foreground mb-4">
              <FaRegUser className="h-5 w-5" />
              Personnel Information
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Sales In Charge
              </h3>
              <div className="bg-secondary/30 p-3 rounded-md hover:bg-secondary/40 transition-colors">
                <p className="font-medium">{ticket.salesInCharge.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ticket.salesInCharge.emailId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Reservation In Charge
              </h3>
              <div className="bg-secondary/30 p-3 rounded-md hover:bg-secondary/40 transition-colors">
                <p className="font-medium">{ticket.reservationInCharge.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ticket.reservationInCharge.emailId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Travel Agent
              </h3>
              <div className="bg-secondary/30 p-3 rounded-md hover:bg-secondary/40 transition-colors">
                <p className="font-medium">{ticket.travelAgent.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ticket.travelAgent.emailId}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Stats */}

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="bg-primary pb-2 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-primary-foreground mb-4">
              <LuMail className="h-5 w-5" />
              Email Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md text-center border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">
                    {ticket.inbox}
                  </p>
                  <p className="text-sm text-blue-700">Received</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md text-center border border-green-100">
                  <p className="text-2xl font-bold text-green-600">
                    {ticket.sent}
                  </p>
                  <p className="text-sm text-green-700">Sent</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Received Date/Time
                </p>
                <p className="bg-secondary/30 p-2 rounded-md">
                  {ticket.receivedDateTime
                    ? format(new Date(ticket.receivedDateTime), "PPpp")
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Sent Date/Time
                </p>
                <p className="bg-secondary/30 p-2 rounded-md">
                  {ticket.sentDateTime
                    ? format(new Date(ticket.sentDateTime), "PPpp")
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Emails Section */}
      <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-primary pb-2 rounded-t-lg">
          <CardTitle className="flex items-center  text-primary-foreground gap-2">
            <Mail className="h-6 w-6 text-primary-foreground" />
            Email Communication
          </CardTitle>
          <CardDescription className="text-primary-foreground">
            {ticket.email.length} email(s) in this conversation
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-5">
              {ticket.email.map((email, index) => (
                <Card
                  key={email.id}
                  className={`border-l-4 ${
                    email.emailType === "received"
                      ? "border-l-blue-500"
                      : "border-l-green-600"
                  } shadow-sm hover:shadow-md transition-all`}
                >
                  <CardHeader className="pb-2 bg-secondary/10">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          <Mail className="h-4 w-4 text-primary" />
                          {email.from.name}{" "}
                          <span className="text-muted-foreground text-sm">
                            &lt;{email.from.email}&gt;
                          </span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          To: {email.to.map((to) => to.name).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            email.rating >= 7 ? "bg-green-50" : "bg-amber-50"
                          }
                        >
                          Rating:{" "}
                          <span className="font-bold ml-1">
                            {email.rating}/10
                          </span>
                        </Badge>
                        <Badge
                          variant={
                            email.emailType === "received"
                              ? "secondary"
                              : "default"
                          }
                          className={
                            email.emailType === "received"
                              ? ""
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }
                        >
                          {email.emailType === "received" ? "Received" : "Sent"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                      {email.timestamp
                        ? format(new Date(email.timestamp), "PPpp")
                        : "N/A"}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-5 leading-relaxed">
                      {email.emailSummary}
                    </p>
                    <div className="flex gap-3 justify-end">
                      <EmailShowcase
                        email={ticket.createdBy.emailId}
                        emailId={email.id}
                        userId={ticket.createdBy.id}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      {ticket.review && <ReviewShowcase review={ticket.review} />}
    </div>
  );
}

export default TicketDashboard;
