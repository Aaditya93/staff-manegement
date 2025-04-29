import { getAllReports } from "@/actions/report/getReport";
import ReportList from "@/components/report/report-list";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const ReportListPage = async () => {
  const reports = await getAllReports();
  console.log("Reports:", reports);

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="flex flex-col h-screen overflow-auto">
        <div className="flex-1 ">
          <div className="hidden md:flex h-full w-full border-b p-4">
            <ReportList reports={reports} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ReportListPage;
export const dynamic = "force-dynamic";
