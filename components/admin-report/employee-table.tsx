"use client";
import { ITicket } from "@/db/models/ticket";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FaUserTie, FaConciergeBell } from "react-icons/fa";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

interface EmployeePerformanceTablesProps {
  tickets: ITicket[];
}

interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  totalTickets: number;
  completedTickets: number;
  avgWaitingTime: number; // in minutes
  totalRevenue: number;
}

// Column definitions for the data table
const columns: ColumnDef<EmployeePerformance>[] = [
  {
    accessorKey: "employeeName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Employee Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("employeeName")}</div>
    ),
  },
  {
    accessorKey: "totalTickets",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Tickets
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("totalTickets")}</div>
    ),
  },
  {
    accessorKey: "completedTickets",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Completed
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("completedTickets")}</div>
    ),
  },
  {
    accessorKey: "completionRate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Completion Rate
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const completedTickets = row.original.completedTickets;
      const totalTickets = row.original.totalTickets;
      const rate = totalTickets > 0 ? completedTickets / totalTickets : 0;

      return (
        <div className="text-center">
          <Badge>{(rate * 100).toFixed(1)}%</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "avgWaitingTime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Avg. Waiting Time
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const waitingTime = row.original.avgWaitingTime;
      return (
        <div className="text-center">
          <Badge variant="secondary">{formatTime(waitingTime)}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "totalRevenue",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Revenue
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <Badge variant="outline" className="font-mono">
          ${row.original.totalRevenue.toLocaleString()}
        </Badge>
      </div>
    ),
  },
];
// Data Table component for employee performance
function DataTable({ data }: { data: EmployeePerformance[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "totalTickets", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="pt-0 pb-0">
      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={
              (table.getColumn("employeeName")?.getFilterValue() as string) ??
              ""
            }
            onChange={(e) =>
              table.getColumn("employeeName")?.setFilterValue(e.target.value)
            }
            className="pl-8 max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border max-h-[300px] overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">
            {Math.min(
              table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1,
              table.getFilteredRowModel().rows.length
            )}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </span>{" "}
          of{" "}
          <span className="font-medium">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          results
        </div>
      </div>
    </div>
  );
}

const EmployeePerformanceTables = ({
  tickets,
}: EmployeePerformanceTablesProps) => {
  // Filter tickets by employee type
  const salesTickets = tickets.filter(
    (ticket) => ticket.salesInCharge && ticket.salesInCharge.id
  );
  const reservationTickets = tickets.filter(
    (ticket) => ticket.reservationInCharge && ticket.reservationInCharge.id
  );

  // Process data for sales employees
  const salesPerformance = processEmployeeData(salesTickets, "sales");
  const reservationPerformance = processEmployeeData(
    reservationTickets,
    "reservation"
  );

  // ...existing code...

  return (
    <div className="w-full ">
      {/* Sales Team Performance */}
      <div className="rounded-none border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaUserTie className="h-5 w-5" />
              Sales Performance
            </h3>
            <Badge variant="outline" className="text-xs font-medium">
              {salesPerformance.length} Employees
            </Badge>
          </div>
          <DataTable data={salesPerformance} />
        </div>
      </div>

      {/* Reservation Team Performance */}
      <div className="rounded-none border shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaConciergeBell className="h-5 w-5" />
              Reservation Performance
            </h3>
            <Badge variant="outline" className="text-xs font-medium">
              {reservationPerformance.length} Employees
            </Badge>
          </div>
          <DataTable data={reservationPerformance} />
        </div>
      </div>
    </div>
  );
};

// Helper function to process employee data from tickets
function processEmployeeData(
  tickets: ITicket[],
  type: "sales" | "reservation"
): EmployeePerformance[] {
  const employeeMap = new Map<string, EmployeePerformance>();

  tickets.forEach((ticket) => {
    // Get the appropriate employee info based on type
    const personInfo =
      type === "sales" ? ticket.salesInCharge : ticket.reservationInCharge;

    // Skip if no valid employee info
    if (!personInfo || !personInfo.id || !personInfo.name) return;

    const employeeId = personInfo.id;
    const employeeName = personInfo.name;

    if (!employeeMap.has(employeeId)) {
      employeeMap.set(employeeId, {
        employeeId,
        employeeName,
        totalTickets: 0,
        completedTickets: 0,
        avgWaitingTime: 0,
        totalRevenue: 0,
      });
    }

    const employee = employeeMap.get(employeeId)!;
    employee.totalTickets += 1;

    if (ticket.status === "Completed") {
      employee.completedTickets += 1;

      // Use waitingTime directly if available or calculate it
      if (ticket.waitingTime) {
        const newAvg =
          (employee.avgWaitingTime * (employee.completedTickets - 1) +
            ticket.waitingTime) /
          employee.completedTickets;
        employee.avgWaitingTime = newAvg;
      }
      // Fall back to calculating from timestamps
      else if (ticket.receivedDateTime && ticket.sentDateTime) {
        const waitingTime =
          (new Date(ticket.sentDateTime).getTime() -
            new Date(ticket.receivedDateTime).getTime()) /
          (1000 * 60); // Convert to minutes

        employee.avgWaitingTime =
          (employee.avgWaitingTime * (employee.completedTickets - 1) +
            waitingTime) /
          employee.completedTickets;
      }

      // Add cost to total revenue
      if (ticket.cost) {
        employee.totalRevenue += ticket.cost;
      }
    }
  });

  return Array.from(employeeMap.values());
}

// Helper function to format time in minutes
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export default EmployeePerformanceTables;
