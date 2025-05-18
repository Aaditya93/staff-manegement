import { getAllEmployees } from "@/actions/travel-agent/employee-list";
import EmployeeListClient from "@/components/travel-agent/employee-list/employee-list";
import AppSidebar from "@/components/travel-agent/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
const EmployeesListPage = async () => {
  const employees = await getAllEmployees();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen ">
        <div className="flex-1 ">
          <div className="hidden md:flex h-full w-full border-b">
            <EmployeeListClient employees={employees} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default EmployeesListPage;
export const dynamic = "force-dynamic";
