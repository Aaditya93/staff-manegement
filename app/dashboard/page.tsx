import Dashboard from "@/components/dashboard/dashboard";
// import AppSidebar from "../../components/sidebar/app-sidebar";

// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Separator } from "@/components/ui/separator";
// import {
//   SidebarInset,
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";

const DashboardPage = async () => {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 ">
      <Dashboard />
    </div>
  );
};

export default DashboardPage;
export const dynamic = "force-dynamic";
