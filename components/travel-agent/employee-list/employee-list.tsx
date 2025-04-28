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
import { Building, Search, Star, Users } from "lucide-react";

interface Employee {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  country: string;
  destination?: string; // New field
  role: string;
  position?: string; // New field
  office?: string; // New field
  rating?: number; // New field (0-10)
  emailVerified: string;
  updatedAt: string;
}

interface EmployeeListClientProps {
  employees: Employee[];
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Star Rating Component
const StarRating = ({ rating }: { rating?: number }) => {
  if (rating === undefined)
    return <span className="text-muted-foreground">Not rated</span>;

  // Convert to scale of 5 stars
  const normalizedRating = rating / 2;
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating - fullStars >= 0.5;

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < fullStars
              ? "text-yellow-400 fill-yellow-400"
              : i === fullStars && hasHalfStar
                ? "text-yellow-400 fill-yellow-400 opacity-50"
                : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm">{normalizedRating.toFixed(1)}/5</span>
    </div>
  );
};

const EmployeeListClient = ({ employees }: EmployeeListClientProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.position?.toLowerCase().includes(query) ||
        false ||
        employee.destination?.toLowerCase().includes(query) ||
        false ||
        employee.office?.toLowerCase().includes(query) ||
        false
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
                  <TableHead className="w-[230px]">Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[130px]">Position</TableHead>
                  <TableHead className="w-[120px]">Destination</TableHead>
                  <TableHead className="w-[100px]">Office</TableHead>
                  <TableHead className="w-[120px]">Rating</TableHead>
                  <TableHead className="w-[130px] text-right">
                    Last Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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
                        {employee.position || (
                          <span className="text-muted-foreground text-sm">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">
                            {employee.destination || employee.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {employee.office ? (
                            <>
                              <Building className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{employee.office}</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not assigned
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StarRating rating={employee.rating} />
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
          placeholder="Search employees by name, email, position or destination..."
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
                    {employee.position || employee.role}{" "}
                    {employee.destination ? `• ${employee.destination}` : ""}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default EmployeeListClient;
