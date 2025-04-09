"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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
  id?: string;
  noOfPax: number;
  companyName: string;
  departureDate: string;
  arrivalDate: string;
  destination: string;
  costOfPackage: number;
  notes: string;
  status: "In Progress" | "Done" | "Rejected";
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
        Company Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("companyName")}</div>,
  },
  {
    accessorKey: "noOfPax",
    header: "Number of Passengers",
    cell: ({ row }) => <div>{row.getValue("noOfPax")}</div>,
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
    accessorKey: "departureDate",
    header: "Departure Date",
    cell: ({ row }) => <div>{row.getValue("departureDate")}</div>,
  },
  {
    accessorKey: "arrivalDate",
    header: "Arrival Date",
    cell: ({ row }) => <div>{row.getValue("arrivalDate")}</div>,
  },
  {
    accessorKey: "costOfPackage",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cost (₹)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>₹{row.getValue("costOfPackage").toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            status === "Done"
              ? "bg-green-100 text-green-800"
              : status === "In Progress"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => <div>{row.getValue("notes")}</div>,
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
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/booking/${row.original.id || "detail"}`}>
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Edit Booking</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Cancel Booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
