import { ITicket } from "@/db/models/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TbPresentationAnalytics } from "react-icons/tb";

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
  };
}

const EmployeeReport = async ({ tickets, user }: ReportPageProps) => {
  co;
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
          <div className=" flex-col grid grid-cols-2   pt-0">
            {/* More ticket data display */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeReport;
