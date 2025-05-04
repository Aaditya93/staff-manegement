import { ITicket } from "@/db/models/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TbPresentationAnalytics } from "react-icons/tb";
import { convertTicketsToChartData } from "./data/line-chart-data";
import { MainLineChart } from "./line-chart";
import EmployeePerformanceTables from "./employee-table";
import { convertTicketsToDestinationChartData } from "./data/destination-chart-data";
import { DestinationBarChart } from "./market-bar-chart";
// Define the props interface for the component
interface ReportPageProps {
  tickets: ITicket[]; // Replace 'any' with your actual ticket type if available
}

const AdminReport = async ({ tickets }: ReportPageProps) => {
  const LineChartData = convertTicketsToChartData(tickets, "receivedDateTime");
  const destinationData = convertTicketsToDestinationChartData(tickets);
  console.log(destinationData);

  return (
    <div className="container mx-auto  ">
      <Card className="w-full ">
        <CardHeader className=" border-b p-4 sm:p-3 bg-primary rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <CardTitle className="flex items-center text-xl font-bold text-center sm:text-left text-primary-foreground">
              <TbPresentationAnalytics className="mr-2 w-8 h-8 text-primary-foreground" />
              Admin Report
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 ">
          <MainLineChart data={LineChartData} />

          <DestinationBarChart data={destinationData} />
          <EmployeePerformanceTables tickets={tickets} />

          <div className=" flex-col grid grid-cols-2   pt-0">
            {/* More ticket data display */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReport;
