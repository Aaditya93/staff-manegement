"use client";
import { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import AppSidebar from "./app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DataTable from "./data-table";
import { columns } from "./columns";
import { mapTicketsToTableData } from "@/utils/ticket-data";
import { ITicket } from "@/db/models/ticket";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { updateUserStatus } from "@/actions/edit-profile/edit-profile";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
interface DashboardProps {
  tickets?: ITicket[];
  status?: string;
}

const Dashboard = ({ tickets = [], status }: DashboardProps) => {
  const [searchSelections, setSearchSelections] = useState<string>("ticket");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isAvailable, setIsAvailable] = useState(status === "Available");

  // Use the mapped ticket data if available, otherwise fall back to sample data
  const tableData = tickets.length > 0 ? mapTicketsToTableData(tickets) : [];

  const handleStatusChange = async (checked: boolean) => {
    setIsAvailable(checked);
    const newStatus = checked ? "Available" : "Busy";

    try {
      // You'll need to implement this function
      const result = await updateUserStatus(newStatus);

      if (result.success) {
        toast.success("Status updated");
      } else {
        toast.error("Failed to update status");
        // Revert UI state if server update failed
        setIsAvailable(!checked);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred");
      // Revert UI state if there was an error
      setIsAvailable(!checked);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar
        searchSelections={searchSelections}
        setSearchSelections={setSearchSelections}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col  p-4">
          <div className="flex items-center ">
            <div className="flex items-center gap-2 text-md">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 h-4 text-primary"
              />
              <div
                className={`h-2.5 w-2.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <Label
                htmlFor="status-toggle"
                className="text-sm whitespace-nowrap"
              >
                {isAvailable ? "Available" : "Busy"}
              </Label>
              <Switch
                id="status-toggle"
                checked={isAvailable}
                onCheckedChange={handleStatusChange}
                className="ml-1.5"
              />
            </div>
          </div>

          <DataTable
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            setSearchSelections={setSearchSelections}
            searchSelections={searchSelections}
            columns={columns}
            data={tableData}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
