"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, User, Users } from "lucide-react";

interface Employee {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  country: string;
  role: string;
  emailVerified: string;
  updatedAt: string;
}

interface EmployeeListClientProps {
  employees: Employee[];
}

const countryFlags: Record<string, string> = {
  us: "🇺🇸",
  jp: "🇯🇵",
  uk: "🇬🇧",
  ca: "🇨🇦",
  au: "🇦🇺",
};

const roleColors: Record<string, string> = {
  ReservationStaff: "bg-blue-100 text-blue-800",
  SalesStaff: "bg-green-100 text-green-800",
  Manager: "bg-purple-100 text-purple-800",
  Admin: "bg-red-100 text-red-800",
  // Add more roles as needed
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const EmployeeListClient = ({ employees }: EmployeeListClientProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query)
      );
    });
  }, [employees, searchQuery]);

  return (
    <>
      <Card className="border-none shadow-sm w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Employees Directory
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {employees.length} employees in the system
              </CardDescription>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[250px]">Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[100px]">Country</TableHead>
                  <TableHead className="w-[180px]">Role</TableHead>
                  <TableHead className="w-[150px] text-right">
                    Last Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No employees found matching your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee._id} className="hover:bg-muted/50">
                      <TableCell className="font-medium flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={employee.image || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.email}
                      </TableCell>
                      <TableCell>
                        <div
                          className="flex items-center gap-1.5"
                          title={employee.country.toUpperCase()}
                        >
                          <span className="text-lg">
                            {countryFlags[employee.country] || employee.country}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {employee.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${roleColors[employee.role] || "bg-gray-100 text-gray-800"} px-2 py-0.5`}
                        >
                          {employee.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(employee.updatedAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput
          placeholder="Search employees by name or email..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No employees found.</CommandEmpty>
          <CommandGroup heading="Employees">
            {filteredEmployees.slice(0, 10).map((employee) => (
              <CommandItem
                key={employee._id}
                onSelect={() => {
                  setSearchQuery(employee.name);
                  setCommandOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={employee.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate">{employee.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {employee.email}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${roleColors[employee.role] || ""} text-xs`}
                >
                  {employee.role}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default EmployeeListClient;
