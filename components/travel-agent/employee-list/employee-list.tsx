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
import { Search, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Employee {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  country: string;
  destination?: string[] | string; // Array of strings or a single string
  role: string;
  position?: string; // New field
  office?: string; // New field
  emailVerified: string;
  updatedAt: string;
  attitude?: number;
  knowledge?: number;
  speed?: number;
  reviewcount?: number;
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
const StarRating = ({
  rating,
  mini = false,
}: {
  rating?: number;
  mini?: boolean;
}) => {
  if (rating === undefined)
    return <span className={mini ? "text-xs" : ""}>Not rated</span>;

  // Convert to scale of 5 stars
  const normalizedRating = rating / 2;
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating - fullStars >= 0.5;
  const starSize = mini ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < fullStars
              ? "text-yellow-400 fill-yellow-400"
              : i === fullStars && hasHalfStar
                ? "text-yellow-400 fill-yellow-400 opacity-50"
                : "text-gray-300"
          }`}
        />
      ))}
      {!mini && (
        <span className="ml-2 text-sm">{normalizedRating.toFixed(1)}/5</span>
      )}
    </div>
  );
};

const EmployeeListClient = ({ employees }: EmployeeListClientProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  // Calculate the overall rating for each employee
  const employeesWithRating = useMemo(() => {
    return employees.map((employee) => {
      let rating;
      if (employee.attitude || employee.knowledge || employee.speed) {
        let sum = 0;
        let count = 0;

        if (employee.attitude) {
          sum += employee.attitude;
          count++;
        }

        if (employee.knowledge) {
          sum += employee.knowledge;
          count++;
        }

        if (employee.speed) {
          sum += employee.speed;
          count++;
        }

        rating = count > 0 ? (sum / count) * 2 : undefined; // Multiply by 2 to match the 10-point scale
      }

      return {
        ...employee,
        rating,
      };
    });
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employeesWithRating.filter((employee) => {
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.position?.toLowerCase().includes(query) ||
        false ||
        (typeof employee.destination === "string" &&
          employee.destination.toLowerCase().includes(query)) ||
        false ||
        employee.office?.toLowerCase().includes(query) ||
        false
      );
    });
  }, [employeesWithRating, searchQuery]);

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
                  <TableHead className="w-[80px]">Attitude</TableHead>
                  <TableHead className="w-[80px]">Knowledge</TableHead>
                  <TableHead className="w-[80px]">Speed</TableHead>
                  <TableHead className="w-[130px] text-right">
                    Last Updated
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No employees found matching your search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => (
                    <TableRow key={employee._id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={employee.image || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          {employee.name}
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>
                        {employee.position || (
                          <span className="text-sm">Not assigned</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {employee.destination ? (
                            Array.isArray(employee.destination) ? (
                              employee.destination.map(
                                (dest: string, index: number) => (
                                  <Badge
                                    key={index}
                                    className="text-xs text-center px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block"
                                  >
                                    {dest}
                                  </Badge>
                                )
                              )
                            ) : (
                              <Badge className="text-xs text-center px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block">
                                {employee.destination}
                              </Badge>
                            )
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {employee.office ? (
                            <>{employee.office}</>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StarRating
                          rating={
                            employee.attitude
                              ? employee.attitude * 2
                              : undefined
                          }
                          mini
                        />
                        {employee.attitude && (
                          <span className="text-xs text-center text-muted-foreground">
                            {employee.attitude.toFixed(1)}/5
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StarRating
                          rating={
                            employee.knowledge
                              ? employee.knowledge * 2
                              : undefined
                          }
                          mini
                        />
                        {employee.knowledge && (
                          <span className="text-xs text-center text-muted-foreground">
                            {employee.knowledge.toFixed(1)}/5
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StarRating
                          rating={
                            employee.speed ? employee.speed * 2 : undefined
                          }
                          mini
                        />
                        {employee.speed && (
                          <span className="text-xs text-center text-muted-foreground">
                            {employee.speed.toFixed(1)}/5
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm ">
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
