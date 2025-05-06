import AppSidebar from "@/components/sidebar/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import UserApprovalCards from "@/components/admin-panel/ta-account";
import { Badge } from "@/components/ui/badge";
import { getTravelAgents } from "@/actions/admin-panel/getTravelAgents";

const AdminPanel = async () => {
  const TravelAgent = await getTravelAgents();
  console.log(TravelAgent);
  const plainObject = JSON.parse(JSON.stringify(TravelAgent));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card className="w-full max-w-6xl sm:max-w-full mx-auto shadow-lg rounded-xl overflow-hidden mt-4 ">
            <CardHeader className=" border-b p-4 sm:p-3 bg-primary">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <CardTitle className="text-xl  text-primary-foreground font-bold text-center sm:text-left">
                  Pending Approval
                </CardTitle>
                <Badge variant={"secondary"}>
                  Total Applications :{" "}
                  {Array.isArray(plainObject) ? plainObject.length : 0}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className=" space-y-4 p-0 ">
              <UserApprovalCards data={plainObject} />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminPanel;
export const dynamic = "force-dynamic";
