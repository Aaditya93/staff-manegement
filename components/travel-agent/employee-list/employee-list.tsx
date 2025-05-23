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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, Star, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConversationById } from "@/actions/travel-agent/employee-list";
// Add these imports at the top with your other imports
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { MapPin } from "lucide-react";
import Link from "next/link";
interface Employee {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  country: string;
  destination?: string[] | string;
  role: string;
  position?: string;
  office?: string;
  emailVerified: string;
  updatedAt: string;
  attitude?: number;
  knowledge?: number;
  speed?: number;
  reviewcount?: number;
  status?: string;
  phoneNumber?: string;
  department?: string;
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
    return <span className={mini ? "text-xs text-center" : ""}>Not rated</span>;

  // Convert to scale of 5 stars
  const normalizedRating = rating / 2;
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating - fullStars >= 0.5;
  const starSize = mini ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className="flex items-center text-center">
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
        <span className="text-center text-lg">
          {normalizedRating.toFixed(1)}/5
        </span>
      )}
    </div>
  );
};

const EmployeeListClient = ({ employees }: EmployeeListClientProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);

  // Filter states
  const [destinationFilter, setDestinationFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [officeFilter, setOfficeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

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

  // Extract unique filter options
  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const destinations = new Set<string>();
    const positions = new Set<string>();
    const offices = new Set<string>();
    const departments = new Set<string>();
    const statuses = new Set<string>();

    employeesWithRating.forEach((employee) => {
      if (Array.isArray(employee.destination)) {
        employee.destination.forEach((dest) => destinations.add(dest));
      } else if (employee.destination) {
        destinations.add(employee.destination as string);
      }

      if (employee.position) positions.add(employee.position);
      if (employee.office) offices.add(employee.office);
      if (employee.department) departments.add(employee.department);
      if (employee.status) statuses.add(employee.status);
    });

    return {
      destinations: Array.from(destinations).sort(),
      positions: Array.from(positions).sort(),
      offices: Array.from(offices).sort(),
      departments: Array.from(departments).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [employeesWithRating]);

  // Apply all filters
  // Apply all filters
  const filteredEmployees = useMemo(() => {
    return employeesWithRating.filter((employee) => {
      // Search query filter
      const matchesSearch =
        searchQuery.toLowerCase() === "" ||
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false ||
        (typeof employee.destination === "string" &&
          employee.destination
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (Array.isArray(employee.destination) &&
          employee.destination.some((d) =>
            d.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        employee.office?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;

      if (!matchesSearch) return false;

      // Destination filter
      const matchesDestination =
        destinationFilter === "all" ||
        (Array.isArray(employee.destination) &&
          employee.destination.includes(destinationFilter)) ||
        employee.destination === destinationFilter;

      if (!matchesDestination) return false;

      // Position filter
      const matchesPosition =
        positionFilter === "all" || employee.position === positionFilter;

      if (!matchesPosition) return false;

      // Office filter
      const matchesOffice =
        officeFilter === "all" || employee.office === officeFilter;

      if (!matchesOffice) return false;

      // Department filter
      const matchesDepartment =
        departmentFilter === "all" || employee.department === departmentFilter;

      if (!matchesDepartment) return false;

      // Status filter
      const matchesStatus =
        statusFilter === "all" || employee.status === statusFilter;

      if (!matchesStatus) return false;

      // Rating filter
      if (ratingFilter !== "all") {
        const ratingValue = parseInt(ratingFilter);
        const employeeRating = employee.rating
          ? Math.floor(employee.rating / 2)
          : undefined;

        if (ratingValue === 0) {
          // "No rating" filter
          if (employeeRating !== undefined) return false;
        } else {
          // Rating value filter (1-5)
          if (employeeRating !== ratingValue) return false;
        }
      }

      return true;
    });
  }, [
    employeesWithRating,
    searchQuery,
    destinationFilter,
    positionFilter,
    officeFilter,
    ratingFilter,
    statusFilter,
    departmentFilter,
  ]);
  // Check if any filters are active
  const hasActiveFilters =
    destinationFilter !== "all" ||
    positionFilter !== "all" ||
    officeFilter !== "all" ||
    ratingFilter !== "all" ||
    statusFilter !== "all" ||
    departmentFilter !== "all";

  // Reset all filters
  const resetFilters = () => {
    setDestinationFilter("all");
    setPositionFilter("all");
    setOfficeFilter("all");
    setRatingFilter("all");
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  return (
    <>
      <Card className="border-none shadow-sm w-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Employees Directory
              </CardTitle>
            </div>
          </div>

          {/* Filters section - aligned in one row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-9 text-sm flex items-left  gap-2 min-w-[140px] max-w-[180px]"
                onClick={() => setCommandOpen(true)}
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-1 flex-wrap ">
              {/* Destination filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm min-w-[140px] max-w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"> Status</SelectItem>
                  <SelectItem value="Available">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                      Available
                    </div>
                  </SelectItem>
                  <SelectItem value="Busy">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                      Busy
                    </div>
                  </SelectItem>
                  {filterOptions.statuses
                    .filter(
                      (status) => status !== "Available" && status !== "Busy"
                    )
                    .map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {/* Department filter */}
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="h-9 text-sm min-w-[140px] max-w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Departments</SelectItem>
                  {filterOptions.departments.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={destinationFilter}
                onValueChange={setDestinationFilter}
              >
                <SelectTrigger className="h-9 text-sm min-w-[140px] max-w-[180px]">
                  <SelectValue placeholder="Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Destinations</SelectItem>
                  {filterOptions.destinations.map((destination) => (
                    <SelectItem key={destination} value={destination}>
                      {destination}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Position filter */}
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="h-9 text-sm min-w-[140px] max-w-[180px]">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Positions</SelectItem>
                  {filterOptions.positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Office filter */}
              <Select value={officeFilter} onValueChange={setOfficeFilter}>
                <SelectTrigger className="h-9 text-sm min-w-[140px] max-w-[180px]">
                  <SelectValue placeholder="Office" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Offices</SelectItem>
                  {filterOptions.offices.map((office) => (
                    <SelectItem key={office} value={office}>
                      {office}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 text-sm min-w-[120px]"
                  >
                    {ratingFilter === "all"
                      ? "Rating"
                      : ratingFilter === "0"
                        ? "No rating"
                        : `${ratingFilter} stars`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by rating</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={ratingFilter}
                    onValueChange={setRatingFilter}
                  >
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <DropdownMenuRadioItem
                        key={stars}
                        value={stars.toString()}
                      >
                        <div className="flex items-center gap-1">
                          {stars.toString()} stars
                          <div className="flex items-center ml-1">
                            {[...Array(stars)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3 text-yellow-400 fill-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </DropdownMenuRadioItem>
                    ))}
                    <DropdownMenuRadioItem value="all">
                      All ratings
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="0">
                      No rating
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFilters}
                  className="h-9 w-9 text-sm flex items-center justify-center text-red-500"
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Sr.</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Office</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Overall Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Chat</TableHead>
                  <TableHead>Status</TableHead>
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
                  filteredEmployees.map((employee, index) => (
                    <TableRow key={employee._id} className="hover:bg-muted/50">
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={employee.image || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            href={`/travel-agent/review/${employee._id}`}
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            {employee.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${employee.email}`}
                          className="text-primary hover:underline"
                          title="Send email"
                        >
                          {employee.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        {employee.phoneNumber || (
                          <span className="text-sm">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {employee.position || (
                          <span className="text-sm">Not assigned</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {employee.destination ? (
                          Array.isArray(employee.destination) ? (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-pointer">
                                  <span className="text-sm font-medium">
                                    {employee.destination.length > 0 && (
                                      <span>{employee.destination[0]}</span>
                                    )}
                                  </span>
                                  {employee.destination.length > 1 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{employee.destination.length - 1}
                                    </Badge>
                                  )}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80 p-4">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {employee.destination.map((dest, index) => (
                                      <Badge
                                        key={index}
                                        className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block"
                                      >
                                        <MapPin className="h-3 w-3 mr-1 inline" />
                                        {dest}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          ) : (
                            <Badge className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full inline-block">
                              {employee.destination}
                            </Badge>
                          )
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Not assigned
                          </span>
                        )}
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
                        <div className="flex items-center gap-1">
                          {employee.department ? (
                            <>{employee.department}</>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center">
                          <StarRating rating={employee.rating} mini />
                          {employee.rating && (
                            <span className="text-xs text-muted-foreground mt-1">
                              {(employee.rating / 2).toFixed(1)}/5
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-medium">
                            {employee.reviewcount || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {employee.reviewcount === 1 ? "Review" : "Reviews"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
                          onClick={async () => {
                            try {
                              // Show loading state
                              const conversationId = await getConversationById(
                                employee._id
                              );
                              // Redirect to conversation
                              window.location.href = `/travel-agent/chat/${conversationId}?150`;
                            } catch (error) {
                              console.error(
                                "Failed to get conversation:",
                                error
                              );
                              // Handle error (could add toast notification here)
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-message-circle"
                          >
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          Chat
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center justify-center">
                          {employee.status ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <div
                                className={`h-2.5 w-2.5 rounded-full ${
                                  employee.status === "Available"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              ></div>
                              <span className="text-sm font-medium">
                                {employee.status === "Available"
                                  ? "Available"
                                  : "Busy"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                              <span className="text-sm text-muted-foreground">
                                Not set
                              </span>
                            </div>
                          )}
                        </div>
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
          placeholder="Search employees by name."
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
