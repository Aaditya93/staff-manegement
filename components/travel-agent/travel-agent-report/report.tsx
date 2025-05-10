import { ITicket } from "@/db/models/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TbPresentationAnalytics } from "react-icons/tb";

import DatePickerWithRange from "./date-range";
import { MainLineChart } from "../report/main-line-chart";
import { convertTicketsToChartData } from "@/components/admin-report/data/line-chart-data";
import { DestinationBarChart } from "@/components/admin-report/market-bar-chart";
import { convertTicketsToDestinationChartData } from "@/components/admin-report/data/destination-chart-data";
import { StageBarChart } from "@/components/employee-report/stage-bar-chart";
import { SpeedHorizontalChart } from "@/components/employee-report/speed-horizontal-chart";
import {
  calculateAverageWaitingTime,
  processInquiriesBySpeed,
} from "@/components/employee-report/speed-chart-data";
import { processInquiriesToChartData } from "@/components/employee-report/pie-chart-data";
import { Badge } from "@/components/ui/badge";

interface TravelAgentReportProps {
  tickets: ITicket[]; // Replace 'any' with your actual ticket type if available
  user: any; // Replace 'any' with your actual user type if available
}

const TravelAgentReport = async ({ tickets, user }: TravelAgentReportProps) => {
  const LineChartData = convertTicketsToChartData(tickets, "receivedDateTime");
  const destinationData = convertTicketsToDestinationChartData(tickets);
  const pieCharData = processInquiriesToChartData(tickets);
  const speedChartData = processInquiriesBySpeed(tickets);
  const waitingTime = calculateAverageWaitingTime(tickets);
  return (
    <div className="container mx-auto mt-4 ">
      <Card className="w-full ">
        <CardHeader className=" border-b p-4 sm:p-3 bg-primary rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <CardTitle className="flex flex-col items-start text-xl font-bold text-center sm:text-left text-primary-foreground">
              <div className="flex items-center ">
                <TbPresentationAnalytics className="mr-2 w-8 h-8 text-primary-foreground" />

                {user.role === "Travel Agent"
                  ? "Analytics Report"
                  : `${user.name}'s Report `}
                {user.role === "Travel Agent" ? (
                  ""
                ) : (
                  <Badge className="ml-6" variant={"secondary"}>
                    {user.email}
                  </Badge>
                )}
              </div>
            </CardTitle>
            <DatePickerWithRange />
          </div>
        </CardHeader>
        <CardContent className="p-0 ">
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

          <div className=" flex-col grid grid-cols-2   pt-0">
            {/* More ticket data display */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelAgentReport;
