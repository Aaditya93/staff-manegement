"use client";
import { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import AppSidebar from "../sidebar/app-sidebar";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DataTable from "./data-table";
import { columns, TravelBooking } from "./columns";
import { mapTicketsToTableData } from "@/utils/ticket-data";
// Sample data as fallback
const sampleData: TravelBooking[] = [
  // ...existing sample data...
];

// Convert ticket data to the format expected by the data table

interface DashboardProps {
  tickets?: any[];
}

const Dashboard = ({ tickets = [] }: DashboardProps) => {
  const [searchSelections, setSearchSelections] =
    useState<string>("companyName");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Use the mapped ticket data if available, otherwise fall back to sample data
  const tableData =
    tickets.length > 0 ? mapTicketsToTableData(tickets) : sampleData;

  return (
    <SidebarProvider>
      <AppSidebar
        data={tableData}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        searchSelections={searchSelections}
        setSearchSelections={setSearchSelections}
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
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
