"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dispatch, SetStateAction } from "react";

import { useSession } from "next-auth/react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchSelections: string;
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  setSearchSelections: Dispatch<SetStateAction<string>>;
}

export const DataTable = <TData, TValue>({
  columnFilters,
  setColumnFilters,
  searchSelections,
  columns,
  data,
  setSearchSelections,
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const session = useSession();
  const role = session.data?.user.role;

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      companyName: true,
      noOfPax: true,
      destination: true,
      departureDate: true,
      arrivalDate: true,
      costOfPackage: true,
      status: true,
      notes: true,
    });

  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater;
      setColumnFilters(newFilters);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-primary-foreground";
      case "In Progress":
        return "bg-primary-foreground";
      case "Rejected":
        return "bg-primary-foreground";
      default:
        return "";
    }
  };
  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder={`Search by ${
            searchSelections === "companyName"
              ? "Company Name"
              : searchSelections === "reservationInCharge"
                ? "Reservation In Charge"
                : searchSelections === "salesInCharge"
                  ? "Sales In Charge"
                  : searchSelections.charAt(0).toUpperCase() +
                    searchSelections.slice(1)
          }...`}
          value={
            (table
              .getColumn(`${searchSelections}`)
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table
              .getColumn(`${searchSelections}`)
              ?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Search by <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={searchSelections === "companyName"}
              onCheckedChange={() => setSearchSelections("companyName")}
            >
              Company Name
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={searchSelections === "destination"}
              onCheckedChange={() => setSearchSelections("destination")}
            >
              Destination
            </DropdownMenuCheckboxItem>

            {role === "Admin" && (
              <DropdownMenuCheckboxItem
                checked={searchSelections === "reservationInCharge"}
                onCheckedChange={() =>
                  setSearchSelections("reservationInCharge")
                }
              >
                Reservation In Charge
              </DropdownMenuCheckboxItem>
            )}
            {role === "Admin" && (
              <DropdownMenuCheckboxItem
                checked={searchSelections === "salesInCharge"}
                onCheckedChange={() => setSearchSelections("salesInCharge")}
              >
                Sales In Charge
              </DropdownMenuCheckboxItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="max-h-60 overflow-y-auto p-2"
            align="end"
          >
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const status = (row.original as any).status || "";

                return (
                  <TableRow
                    key={row.id}
                    className={getStatusColor(status)}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
