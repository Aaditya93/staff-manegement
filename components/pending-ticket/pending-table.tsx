"use client";

import { useState } from "react";
import { DataTable } from "@/components/pending-ticket/data-table";
import { TicketProvider } from "@/components/pending-ticket/context";
import { SelectSalesStaff } from "@/components/pending-ticket/select-sales";
import { SelectEstimatedTime } from "@/components/pending-ticket/select-estimated-time";
import { ApproveControl } from "@/components/pending-ticket/approve";
import { DeleteControl } from "@/components/pending-ticket/delete";
import { ColumnFiltersState } from "@tanstack/react-table";

// PersonnelInfo interface to match the database schema
interface PersonnelInfo {
  id?: string;
  name: string;
  emailId: string;
}

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  country?: string;
  __v?: number;
}

// Updated Ticket interface to better match the database schema
interface Ticket {
  _id: { toString: () => string };
  companyName: string;
  destination: string;
  arrivalDate?: Date | string;
  departureDate?: Date | string;
  pax: number;
  receivedDateTime: string;
  sentDateTime?: string;
  salesInCharge?: PersonnelInfo;
  reservationInCharge?: PersonnelInfo;
  travelAgent?: PersonnelInfo;
  createdBy?: PersonnelInfo;
  market?: string;
  status?: string;
  estimateTimeToSendPrice?: number;
  cost?: number;
  waitingTime?: number;
  approvedBy?: PersonnelInfo;
  speed?: string;
  inbox?: number;
  sent?: number;
  lastMailTimeReceived?: number;
  lastMailTimeSent?: number;
  balance?: number;
  isApproved?: boolean;
  [key: string]: any;
}

function formatDate(date: Date | string | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(date: Date | string | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

interface PendingTicketsTableProps {
  tickets: Ticket[];
  salesStaff: Employee[];
}

export function PendingTicketsTable({
  tickets,
  salesStaff,
}: PendingTicketsTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchSelections, setSearchSelections] = useState("companyName");

  const filteredTickets = tickets;

  const columns = [
    {
      accessorKey: "companyName",
      header: "Agent",
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "arrivalDate",
      header: "Arrival",
      cell: ({ row }: { row: any }) => formatDate(row.original.arrivalDate),
    },
    {
      accessorKey: "departureDate",
      header: "Departure",
      cell: ({ row }: { row: any }) => formatDate(row.original.departureDate),
    },
    {
      accessorKey: "pax",
      header: "Pax",
    },
    {
      accessorKey: "receivedDateTime",
      header: "Received Time",
      cell: ({ row }: { row: any }) =>
        formatDateTime(row.original.receivedDateTime),
    },
    {
      id: "salesInCharge",
      header: "Sales Staff",
      cell: ({ row }: { row: any }) => {
        return (
          <SelectSalesStaff
            staffList={salesStaff}
            default={row.original.salesInCharge}
          />
        );
      },
    },
    {
      id: "estimatedTime",
      header: "Estimated Time",
      cell: ({ row }: { row: any }) => (
        <SelectEstimatedTime defaultTime={"1H"} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex space-x-2">
          <ApproveControl ticketId={row.original._id.toString()} />
          <DeleteControl ticketId={row.original._id.toString()} />
        </div>
      ),
    },
  ];

  return (
    <TicketProvider ticketId="">
      <div className="space-y-4">
        <DataTable
          columns={columns}
          data={filteredTickets}
          searchSelections={searchSelections}
          setSearchSelections={setSearchSelections}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />
      </div>
    </TicketProvider>
  );
}
