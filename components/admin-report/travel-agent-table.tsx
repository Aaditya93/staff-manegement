"use client";
import { ITicket } from "@/db/models/ticket";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FaSuitcase } from "react-icons/fa";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import Link from "next/link";

interface TravelAgentTableProps {
  tickets: ITicket[];
}

interface TravelAgentPerformance {
  agentId: string;
  agentName: string;
  totalTickets: number;
  totalBookings: number;
  destinationsCovered: string[];
  totalRevenue: number;
}
const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);
const sevendaysAgo = new Date(today);
sevendaysAgo.setDate(today.getDate() - 7);

const seven = sevendaysAgo.toISOString().split("T")[0];

const to = today.toISOString().split("T")[0];
const columns: ColumnDef<TravelAgentPerformance>[] = [
  {
    accessorKey: "agentName",
    header: "Agent Name",
    cell: ({ row }) => (
      <div className="text-center w-full">{row.getValue("agentName")}</div>
    ),
  },
  {
    accessorKey: "totalTickets",
    header: "Total Tickets",
    cell: ({ row }) => (
      <div className="text-center w-full">{row.getValue("totalTickets")}</div>
    ),
  },
  {
    accessorKey: "totalBookings",
    header: "Total Bookings",
    cell: ({ row }) => (
      <div className="text-center w-full">{row.getValue("totalBookings")}</div>
    ),
  },
  {
    accessorKey: "destinationsCovered",
    header: "Destinations",
    cell: ({ row }) => {
      const destinations = row.original.destinationsCovered;
      const count = destinations.length;

      return (
        <div className="text-center w-full">
          <div className="text-xs text-muted-foreground mt-1">
            {destinations.slice(0, 2).join(", ")}
            {count > 2 ? ` +${count - 2} more` : ""}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalRevenue",
    header: "Total Revenue",
    cell: ({ row }) => (
      <div className="text-center w-full">
        <Badge variant="outline" className="font-mono ">
          ${row.original.totalRevenue.toLocaleString()}
        </Badge>
      </div>
    ),
  },
  {
    id: "actions",
    header: "View",
    cell: ({ row }) => {
      const agentId = row.original.agentId;
      return (
        <div className="text-center w-full">
          <Link href={`/agent-report/${agentId}/from=${seven}&to=${to}`}>
            View Profile
          </Link>
        </div>
      );
    },
  },
];
// Data Table component for travel agent performance
function DataTable({ data }: { data: TravelAgentPerformance[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "totalRevenue", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="pt-0 pb-0">
      <div className="flex items-center py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={
              (table.getColumn("agentName")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("agentName")?.setFilterValue(e.target.value)
            }
            className="pl-8 max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <div className="max-h-[300px] overflow-auto">
          {" "}
          {/* Increased height for scrolling */}
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center">
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
                      <TableCell key={cell.id} className="text-center">
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
      </div>
      <div className="text-sm text-muted-foreground pt-2 text-right">
        {table.getFilteredRowModel().rows.length} total results
      </div>
    </div>
  );
}

const TravelAgentTable = ({ tickets }: TravelAgentTableProps) => {
  // Process data for travel agents
  const travelAgentPerformance = processTravelAgentData(tickets);

  return (
    <div className="rounded-none border shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaSuitcase className="h-5 w-5" />
            Travel Agent Performance
          </h3>
          <Badge variant="outline" className="text-xs font-medium">
            {travelAgentPerformance.length} Agents
          </Badge>
        </div>
        <DataTable data={travelAgentPerformance} />
      </div>
    </div>
  );
};

// Helper function to process travel agent data from tickets
function processTravelAgentData(tickets: ITicket[]): TravelAgentPerformance[] {
  const agentMap = new Map<string, TravelAgentPerformance>();

  tickets.forEach((ticket) => {
    // Skip tickets without travel agent info
    if (
      !ticket.travelAgent ||
      !ticket.travelAgent.id ||
      !ticket.travelAgent.name
    )
      return;

    const agentId = ticket.travelAgent.id;
    const agentName = ticket.travelAgent.name;
    const destination = ticket.destination || "Unknown";

    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, {
        agentId,
        agentName,
        totalTickets: 0,
        totalBookings: 0,
        destinationsCovered: [],
        totalRevenue: 0,
      });
    }

    const agent = agentMap.get(agentId)!;
    agent.totalTickets += 1;

    // Count completed tickets as bookings
    if (ticket.status === "Completed") {
      agent.totalBookings += 1;
    }

    // Add destination if not already included
    if (!agent.destinationsCovered.includes(destination)) {
      agent.destinationsCovered.push(destination);
    }

    // Add cost to total revenue for completed tickets
    if (ticket.status === "Completed" && ticket.cost) {
      agent.totalRevenue += ticket.cost;
    }
  });

  return Array.from(agentMap.values());
}

export default TravelAgentTable;
