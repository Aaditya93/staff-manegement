"use client";
import { useState } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import AppSidebar from "../sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DataTable from "./data-table";
import { columns, TravelBooking } from "./columns";

// Our sample travel booking data
const data: TravelBooking[] = [
  {
    noOfPax: 2,
    companyName: "Wanderlust Pvt Ltd",
    departureDate: "2025-05-12",
    arrivalDate: "2025-05-20",
    destination: "Bali",
    costOfPackage: 85000,
    notes: "Awaiting confirmation on hotel preference",
    status: "In Progress",
  },
  {
    noOfPax: 4,
    companyName: "Global Trekkers",
    departureDate: "2025-06-01",
    arrivalDate: "2025-06-10",
    destination: "Switzerland",
    costOfPackage: 320000,
    notes: "Final quote shared, client reviewing",
    status: "In Progress",
  },
  {
    noOfPax: 1,
    companyName: "Nomad Escapes",
    departureDate: "2025-04-28",
    arrivalDate: "2025-05-05",
    destination: "Dubai",
    costOfPackage: 55000,
    notes: "Payment done, visa shared",
    status: "Done",
  },
  {
    noOfPax: 3,
    companyName: "Horizon Travels",
    departureDate: "2025-05-15",
    arrivalDate: "2025-05-25",
    destination: "Singapore",
    costOfPackage: 120000,
    notes: "Deal closed, confirmed with full payment",
    status: "Done",
  },
  {
    noOfPax: 2,
    companyName: "Dream Holidays",
    departureDate: "2025-05-03",
    arrivalDate: "2025-05-11",
    destination: "Thailand",
    costOfPackage: 70000,
    notes: "Client chose another agent",
    status: "Rejected",
  },
  {
    noOfPax: 5,
    companyName: "Travel Mates",
    departureDate: "2025-06-20",
    arrivalDate: "2025-06-30",
    destination: "Europe (Multi-City)",
    costOfPackage: 450000,
    notes: "In negotiation stage",
    status: "In Progress",
  },
  {
    noOfPax: 2,
    companyName: "Elite Voyages",
    departureDate: "2025-04-18",
    arrivalDate: "2025-04-24",
    destination: "Maldives",
    costOfPackage: 110000,
    notes: "Booked and confirmed with resort",
    status: "Done",
  },
  {
    noOfPax: 1,
    companyName: "City Breaks",
    departureDate: "2025-05-10",
    arrivalDate: "2025-05-14",
    destination: "Sri Lanka",
    costOfPackage: 48000,
    notes: "Cancelled due to personal reasons",
    status: "Rejected",
  },
];

const Dashboard = () => {
  const [searchSelections, setSearchSelections] =
    useState<string>("companyName");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  return (
    <SidebarProvider>
      <AppSidebar
        data={data}
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
            data={data}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
