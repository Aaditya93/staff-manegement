"use client";
import { ArrowUpDown, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

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
    accessorKey: "ticket",
    header: "Ticket",
    cell: ({ row }) => <div>{row.getValue("ticket")}</div>,
  },
  {
    id: "view",
    header: () => <div className="text-center">View</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-blue-600 hover:bg-blue-50 mx-auto"
          asChild
        >
          <Link href={`/travel-agent/ticket/${row.original.ticket}`}>
            <Eye className="h-2 w-2 " />
            View
          </Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "receivedTime",
    header: "Received time",
    cell: ({ row }) => {
      const timestamp = row.getValue("receivedTime");

      // Check if timestamp exists and is valid
      if (!timestamp) return <div>-</div>;

      try {
        // Convert string timestamp to Date object
        const date = new Date(String(timestamp));

        // Format the date to local timezone with readable format
        const localDate = date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return <div title={`UTC: ${timestamp}`}>{localDate}</div>;
      } catch (error) {
        console.error("Error parsing date:", error);
        // Fallback if date parsing fails
        return <div>{String(timestamp)}</div>;
      }
    },
  },

  {
    accessorKey: "destination",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Destination
        <ArrowUpDown className=" h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center w-full">{row.getValue("destination")}</div>
    ),
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
    accessorKey: "noOfPax",
    header: "Pax",
    cell: ({ row }) => <div>{row.getValue("noOfPax")}</div>,
  },
  {
    accessorKey: "reservationInCharge",
    header: "Reservation",
    cell: ({ row }) => <div>{row.getValue("reservationInCharge")}</div>,
  },
  {
    accessorKey: "salesInCharge",
    header: "Sales",
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
    header: () => <div className="text-center w-full">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      // Capitalize first letter and remove underscores if they exist
      const formattedStatus = status
        ? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")
        : "";

      return (
        <div className="flex justify-center w-full">
          <div
            className={`rounded-full px-2 py-1 text-xs font-medium text-center ${
              status === "done" || status === "Done"
                ? "bg-green-100 text-green-800"
                : status === "new" || status === "In Progress"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {formattedStatus}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "estimateTimeToSendPrice",
    header: "Estimate time ",
    cell: ({ row }) => {
      const seconds = row.getValue("estimateTimeToSendPrice") as number;
      const hours = seconds / 3600; // Convert seconds to hours

      return <div>{hours.toFixed(2)} hrs</div>;
    },
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
    cell: ({ row }) => (
      <div className="text-center w-full">${row.getValue("costOfPackage")}</div>
    ),
  },
];
