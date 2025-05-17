"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ExternalLink,
  CheckCircle,
  Info,
  Users,
  User,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import Link from "next/link";
import { resolveReport } from "@/actions/report/getReport";
import DatePickerWithRange from "./date-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface Report {
  _id: string;
  title: string;
  description: string;
  ticketId: string;
  travelAgentId: StaffMember;
  salesId: StaffMember;
  reservationId: StaffMember;
  complaintType: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ReportListProps {
  reports: Report[];
}

const ReportList = ({ reports }: ReportListProps) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  // Get unique travel agents from reports
  const travelAgents = React.useMemo(() => {
    const uniqueAgents = new Map();
    reports.forEach((report) => {
      if (report.travelAgentId) {
        uniqueAgents.set(report.travelAgentId._id, report.travelAgentId);
      }
    });
    return Array.from(uniqueAgents.values());
  }, [reports]);

  // Filter reports by selected agent
  const filteredReports = React.useMemo(() => {
    if (selectedAgent === "all") return reports;
    return reports.filter(
      (report) => report.travelAgentId._id === selectedAgent
    );
  }, [reports, selectedAgent]);

  const handleViewTicket = (ticketId: string) => {
    // Navigate to ticket page
    console.log("Viewing ticket:", ticketId);
  };

  const handleResolveTicket = async (reportId: string) => {
    const result = await resolveReport(reportId);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleShowDetails = (report: Report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  const formatDateTime = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <>
      <Card
        className={`w-full max-w-6xl sm:max-w-full mx-auto shadow-lg rounded-xl overflow-hidden flex flex-col min-h-[600px]`}
      >
        <CardHeader className="p-4 sm:p-3 bg-primary rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <CardTitle className="text-xl font-bold text-center sm:text-left text-primary-foreground flex flex-col sm:flex-row items-center gap-2">
              <span>Travel Agent Complaints</span>
              <Badge variant="secondary" className="text-primary ml-0 sm:ml-2">
                {filteredReports.length} Total Complaints
              </Badge>
            </CardTitle>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="w-[180px] bg-white text-primary">
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {travelAgents.map((agent) => (
                    <SelectItem key={agent._id} value={agent._id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DatePickerWithRange />
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={`p-0 flex-grow overflow-auto ${filteredReports.length === 0 ? "flex items-center justify-center min-h-[200px]" : ""}`}
        >
          <div>
            {filteredReports.length === 0 && (
              <div className="text-center p-6 text-muted-foreground">
                No complaints found for the selected agent
              </div>
            )}
            {filteredReports.map((report) => (
              <div
                key={report._id.toString()}
                className="p-4 hover:bg-primary-foreground transition-colors duration-200 relative border-b"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      #{report.ticketId.toString().slice(-6)}
                    </Badge>
                    <Badge variant="secondary">
                      {report.complaintType.charAt(0).toUpperCase() +
                        report.complaintType.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                    <div>
                      <p className="text-xs">Issue</p>
                      <p className="font-medium text-sm">{report.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                    <div>
                      <p className="text-xs">Travel Agent</p>
                      <p className="text-sm">{report.travelAgentId.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                    <div>
                      <p className="text-xs">Date Reported</p>
                      <p className="text-sm">{formatDate(report.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 flex-shrink-0 sm:w-4 sm:h-4" />
                    <div>
                      <p className="text-xs">Assigned Staff</p>
                      <p className="text-sm">{report.reservationId?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShowDetails(report)}
                  >
                    <Info className="w-4 h-4 mr-1" />
                    View Details
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewTicket(report.ticketId.toString())}
                    asChild
                  >
                    <Link href={`/ticket/${report.ticketId}`}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View Ticket
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveTicket(report._id.toString())}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="bg-background p-4 sm:p-3 flex justify-between items-center mt-auto">
          <p className="text-sm">Last Updated: {formatDateTime(new Date())}</p>
        </CardFooter>
      </Card>

      {/* Dialog for showing report details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-[600px] md:max-w-[700px] max-h-[90vh] overflow-y-auto"
          position="center"
        >
          {selectedReport && (
            <>
              <DialogHeader className="space-y-1">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl">Report Details</DialogTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      #{selectedReport.ticketId.toString().slice(-6)}
                    </Badge>
                    <Badge variant="secondary">
                      {selectedReport.complaintType.charAt(0).toUpperCase() +
                        selectedReport.complaintType.slice(1)}
                    </Badge>
                  </div>
                </div>
                <DialogDescription>
                  Created on {formatDateTime(selectedReport.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Issue</h4>
                  <p className="text-base font-medium">
                    {selectedReport.title}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Complaint Type</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedReport.complaintType}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground ">
                    {selectedReport.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" /> Travel Agent
                    </h4>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedReport.travelAgentId?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedReport.travelAgentId?.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" /> Sales Staff
                    </h4>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedReport.salesId.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedReport.salesId.email}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {selectedReport.salesId?.position}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {selectedReport.salesId?.office}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" /> Reservation Staff
                    </h4>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedReport.reservationId?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedReport.reservationId?.email}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {selectedReport.reservationId?.position}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {selectedReport.reservationId?.office}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <div className="flex gap-2 justify-end w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleResolveTicket(selectedReport._id.toString())
                    }
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve Ticket
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href={`/ticket/${selectedReport.ticketId}`}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Go to Ticket
                    </Link>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportList;
