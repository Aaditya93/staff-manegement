"use client";
import { ArrowUpDown } from "lucide-react";
import { Eye, Edit } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { StatusCell } from "./status-cell";
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
    accessorKey: "companyName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const companyName = row.getValue("companyName") as string;
      // Capitalize first letter if companyName exists
      const capitalizedCompanyName = companyName
        ? companyName.charAt(0).toUpperCase() + companyName.slice(1)
        : "";

      return <div className="text-center">{capitalizedCompanyName}</div>;
    },
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
          <Link href={`/ticket/${row.original.ticket}`}>
            <Eye className="h-2 w-2 " />
            View
          </Link>
        </Button>
      );
    },
  },
  {
    id: "edit",
    header: () => <div className="text-center">Edit</div>,
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-amber-600 hover:bg-amber-50 mx-auto"
          asChild
        >
          <Link href={`/ticket-edit/${row.original.ticket}`}>
            <Edit className="h-2 w-2 " />
            Edit
          </Link>
        </Button>
      );
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
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("destination")}</div>
    ),
  },
  {
    accessorKey: "arrival",
    header: "Arrival",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("arrival")}</div>
    ),
  },
  {
    accessorKey: "departure",
    header: "Departure",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("departure")}</div>
    ),
  },
  {
    accessorKey: "reservationInCharge",
    header: "Reservation in Charge",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("reservationInCharge")}</div>
    ),
  },
  {
    accessorKey: "salesInCharge",
    header: "Sales in Charge",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("salesInCharge")}</div>
    ),
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

      return <div className="text-center">{capitalizedMarket}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-full">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const ticketId = row.original.ticket;

      return <StatusCell defaultStatus={status} ticketId={ticketId} />;
    },
  },
  {
    accessorKey: "estimateTimeToSendPrice",
    header: "Estimate time",
    cell: ({ row }) => {
      const seconds = row.getValue("estimateTimeToSendPrice") as number;

      // Convert seconds to hours (with 2 decimal places)
      const hours = seconds ? (seconds / 3600).toFixed(2) : "0";

      return <div className="text-center">{hours} hrs</div>;
    },
  },
  {
    accessorKey: "waitingTime",
    header: "Waiting time",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("waitingTime")}</div>
    ),
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

      return <div className="text-center">{capitalizedSpeed}</div>;
    },
  },
  {
    accessorKey: "inbox",
    header: "Inbox",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("inbox")}</div>
    ),
  },
  {
    accessorKey: "sent",
    header: "Sent",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("sent")}</div>
    ),
  },
  {
    accessorKey: "timeSent",
    header: "Time sent",
    cell: ({ row }) => {
      const timestamp = row.getValue("timeSent");

      // Check if timestamp exists and is valid
      if (!timestamp) return <div>-</div>;

      try {
        // Convert string timestamp to Date object
        const date = new Date(timestamp as string | number | Date);

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
        return <div className="text-center">{String(timestamp)}</div>;
      }
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
        const date = new Date(timestamp as string | number | Date);

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
        return <div className="text-center">{String(timestamp)}</div>;
      }
    },
  },
  {
    accessorKey: "lastInbox",
    header: "Last inbox",
    cell: ({ row }) => {
      const timestamp = row.getValue("lastInbox");

      // Check if timestamp exists and is valid
      if (!timestamp) return <div>-</div>;

      try {
        // Convert string timestamp to Date object
        const date = new Date(timestamp as string);

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
        return <div className="text-center">{String(timestamp)}</div>;
      }
    },
  },
  {
    accessorKey: "lastSent",
    header: "Last sent",
    cell: ({ row }) => {
      const timestamp = row.getValue("lastSent");

      // Check if timestamp exists and is valid
      if (!timestamp) return <div>-</div>;

      try {
        // Convert string timestamp to Date object
        const date = new Date(timestamp as string);

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
        return <div className="text-center">{String(timestamp)}</div>;
      }
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("balance")}</div>
    ),
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
      <div className="text-center">${row.getValue("costOfPackage")}</div>
    ),
  },
];
