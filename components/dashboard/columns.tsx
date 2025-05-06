"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Eye, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Define the TravelBooking type to match our data structure
export type TravelBooking = {
  _id: string;
  agent: string;
  receivedTime: string;
  noOfPax: number;
  ticket: string;
  destination: string;
  arrival: string;
  departure: string;
  reservationInCharge: string;
  salesInCharge: string;
  market: string;
  status: string;
  estimateTimeToSendPrice: number;
  waitingTime: number;
  speed: string;
  inbox: number;
  sent: number;
  timeSent: number;
  lastInbox: string;
  lastSent: string;
  balance: number;
  email: number;
  costOfPackage: number;
};

export const columns: ColumnDef<TravelBooking>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const companyName = row.getValue("companyName") as string;
      // Capitalize first letter if companyName exists
      const capitalizedCompanyName = companyName
        ? companyName.charAt(0).toUpperCase() + companyName.slice(1)
        : "";

      return <div>{capitalizedCompanyName}</div>;
    },
  },

  {
    accessorKey: "noOfPax",
    header: "Pax",
    cell: ({ row }) => <div>{row.getValue("noOfPax")}</div>,
  },
  {
    accessorKey: "ticket",
    header: "Ticket",
    cell: ({ row }) => <div>{row.getValue("ticket")}</div>,
  },
  {
    accessorKey: "destination",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Destination
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("destination")}</div>,
  },
  {
    accessorKey: "arrival",
    header: "Arrival",
    cell: ({ row }) => <div>{row.getValue("arrival")}</div>,
  },
  {
    accessorKey: "departure",
    header: "Departure",
    cell: ({ row }) => <div>{row.getValue("departure")}</div>,
  },
  {
    accessorKey: "reservationInCharge",
    header: "Reservation in Charge",
    cell: ({ row }) => <div>{row.getValue("reservationInCharge")}</div>,
  },
  {
    accessorKey: "salesInCharge",
    header: "Sales in Charge",
    cell: ({ row }) => <div>{row.getValue("salesInCharge")}</div>,
  },
  {
    accessorKey: "market",
    header: "Market",
    cell: ({ row }) => {
      const market = row.getValue("market") as string;
      // Capitalize first letter if market exists
      const capitalizedMarket = market
        ? market.charAt(0).toUpperCase() + market.slice(1)
        : "";

      return <div>{capitalizedMarket}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      // Capitalize first letter if status exists
      const capitalizedStatus = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "";

      return (
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            status === "done" || status === "Done"
              ? "bg-green-100 text-green-800"
              : status === "new" || status === "In Progress"
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {capitalizedStatus}
        </div>
      );
    },
  },
  {
    accessorKey: "estimateTimeToSendPrice",
    header: "Estimate time",
    cell: ({ row }) => {
      const seconds = row.getValue("estimateTimeToSendPrice") as number;

      // Convert seconds to hours (with 2 decimal places)
      const hours = seconds ? (seconds / 3600).toFixed(2) : "0";

      return <div>{hours} hrs</div>;
    },
  },
  {
    accessorKey: "waitingTime",
    header: "Waiting time",
    cell: ({ row }) => <div>{row.getValue("waitingTime")}</div>,
  },

  {
    accessorKey: "speed",
    header: "Speed",
    cell: ({ row }) => {
      const speed = row.getValue("speed") as string;
      // Capitalize first letter if speed exists
      const capitalizedSpeed = speed
        ? speed.charAt(0).toUpperCase() + speed.slice(1)
        : "";

      return <div>{capitalizedSpeed}</div>;
    },
  },
  {
    accessorKey: "inbox",
    header: "Inbox",
    cell: ({ row }) => <div>{row.getValue("inbox")}</div>,
  },
  {
    accessorKey: "sent",
    header: "Sent",
    cell: ({ row }) => <div>{row.getValue("sent")}</div>,
  },
  {
    accessorKey: "timeSent",
    header: "Time sent",
    cell: ({ row }) => <div>{row.getValue("timeSent")}</div>,
  },
  {
    accessorKey: "receivedTime",
    header: "Received time",
    cell: ({ row }) => <div>{row.getValue("receivedTime")}</div>,
  },
  {
    accessorKey: "lastInbox",
    header: "Last inbox",
    cell: ({ row }) => <div>{row.getValue("lastInbox")}</div>,
  },
  {
    accessorKey: "lastSent",
    header: "Last sent",
    cell: ({ row }) => <div>{row.getValue("lastSent")}</div>,
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => <div>{row.getValue("balance")}</div>,
  },

  {
    accessorKey: "costOfPackage",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cost
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>${row.getValue("costOfPackage")}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-semibold">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuItem
              asChild
              className="flex items-center cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <Link
                href={`/ticket/${row.original.ticket}`}
                className="flex w-full items-center"
              >
                <Eye className="h-4 w-4 mr-2 text-blue-600" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="flex items-center cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <Link
                href={`/ticket-edit/${row.original.ticket}`}
                className="flex w-full items-center"
              >
                <Edit className="h-4 w-4 mr-2 text-amber-600" />
                Edit Ticket
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
