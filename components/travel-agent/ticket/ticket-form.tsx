"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import * as z from "zod";
import { LiaMapSolid } from "react-icons/lia";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  MapPin,
  User,
  Users,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { toast } from "sonner";
import { updateTicket } from "@/actions/tickets/edit-ticket";
import { useRouter } from "next/navigation";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
// Form schema
const formSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  companyName: z.string().min(2, "Company name is required"),
  arrivalDate: z.date({ required_error: "Arrival date is required" }),
  departureDate: z.date({ required_error: "Departure date is required" }),
  pax: z.number().min(1, "Number of passengers is required"),
  cost: z.number().min(1, "Cost is required"),
  speed: z.string().min(1, "Speed is required"),
  salesInCharge: z.string().min(1, "Sales in charge is required"),
  reservationInCharge: z.string().min(1, "Reservation in charge is required"),
  travelAgent: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  market: z.string().optional(),
});

export default function EditTicketForm({
  ticket,
  employees = [],
}: {
  ticket: any;
  employees: any[];
}) {
  // In a real application, you would fetch the ticket data based on the ID
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Filter employees by role
  const employeeArray = Array.isArray(employees) ? employees : [];

  const salesPersonnel = employeeArray
    .filter((employee) => employee?.role === "SalesStaff")
    .map((employee) => ({
      id: employee._id.toString(),
      name: employee.name,
      emailId: employee.email,
      country: employee.country,
    }));

  const reservationPersonnel = employeeArray
    .filter((employee) => employee?.role === "ReservationStaff")
    .map((employee) => ({
      id: employee._id.toString(),
      name: employee.name,
      emailId: employee.email,
      country: employee.country,
    }));

  // For travel agents - if we don't have any, we'll use all employees
  const travelAgents = employeeArray
    .filter((employee) => employee?.role === "TravelAgent")
    .map((employee) => ({
      id: employee._id.toString(),
      name: employee.name,
      emailId: employee.email,
      country: employee.country,
    }));

  // Initialize the form with fallbacks if no personnel data is available
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      destination: ticket?.destination || "",
      companyName: ticket?.companyName || "",
      market: ticket?.market || "",
      arrivalDate: ticket?.arrivalDate
        ? new Date(ticket.arrivalDate)
        : new Date(),
      departureDate: ticket?.departureDate
        ? new Date(ticket.departureDate)
        : new Date(),
      pax: ticket?.pax || "",
      cost: ticket?.cost || 0,
      speed: ticket?.speed || "normal",
      salesInCharge: ticket?.salesInCharge.id || salesPersonnel[0]?.id || "",
      reservationInCharge:
        ticket?.reservationInCharge.id || reservationPersonnel[0]?.id || "",
      travelAgent:
        ticket?.travelAgent?.id ||
        ticket?.travelAgent ||
        travelAgents[0]?.id ||
        "",
      status: ticket?.status || "pending",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await updateTicket(ticket._id, values, employees);

      if (result.success) {
        toast.success("Ticket updated successfully");
        router.push(`/ticket/${ticket._id}`);
      } else {
        toast.error("Failed to update ticket");
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Ticket</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="bg-primary rounded-t-lg pb-3 text-primary-foreground">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                  Destination & Trip Details
                </CardTitle>
                <CardDescription className="text-sm text-primary-foreground">
                  Enter the travel destination and trip details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter destination"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter company name"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="arrivalDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Arrival Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="departureDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Departure Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          PAX
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Number of passengers"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Cost
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter cost"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber || 0)
                            }
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="speed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Speed
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background w-full">
                              <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="slow">Slow</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="slow">Slow</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="market"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <LiaMapSolid className="h-4 w-4 text-primary" />
                          Market
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background w-full">
                              <SelectValue placeholder="Select market" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="japan">Japan</SelectItem>
                            <SelectItem value="china">China</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                            <SelectItem value="germany">Germany</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Personnel Info */}
            <Card>
              <CardHeader className="bg-primary pb-3 text-primary-foreground rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5 text-primary-foreground" />
                  Personnel Information
                </CardTitle>
                <CardDescription className="text-sm text-primary-foreground">
                  Select the staff members in charge of this trip
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="salesInCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-secondary" />
                          Sales In Charge
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between bg-background px-3 font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  salesPersonnel.find(
                                    (person) => person.id === field.value
                                  )?.name
                                ) : (
                                  <span>Select sales person</span>
                                )}
                                <ChevronDown
                                  size={16}
                                  className="shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search sales staff..." />
                              <CommandList>
                                <CommandEmpty>
                                  No sales staff found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {salesPersonnel.map((person) => (
                                    <CommandItem
                                      key={person.id}
                                      value={`${person.name} ${person.emailId}`}
                                      onSelect={() => {
                                        field.onChange(person.id);
                                      }}
                                    >
                                      <div className="flex flex-col items-start">
                                        <div>{person.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {person.emailId}
                                        </div>
                                      </div>
                                      {field.value === person.id && (
                                        <Check size={16} className="ml-auto" />
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reservationInCharge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-secondary" />
                          Reservation In Charge
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between bg-background px-3 font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  reservationPersonnel.find(
                                    (person) => person.id === field.value
                                  )?.name
                                ) : (
                                  <span>Select reservation person</span>
                                )}
                                <ChevronDown
                                  size={16}
                                  className="shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search reservation staff..." />
                              <CommandList>
                                <CommandEmpty>
                                  No reservation staff found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {reservationPersonnel.map((person) => (
                                    <CommandItem
                                      key={person.id}
                                      value={`${person.name} ${person.emailId}`}
                                      onSelect={() => {
                                        field.onChange(person.id);
                                      }}
                                    >
                                      <div className="flex flex-col items-start">
                                        <div>{person.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {person.emailId}
                                        </div>
                                      </div>
                                      {field.value === person.id && (
                                        <Check size={16} className="ml-auto" />
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="travelAgent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-secondary" />
                          Travel Agent
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between bg-background px-3 font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  travelAgents.find(
                                    (agent) => agent.id === field.value
                                  )?.name
                                ) : (
                                  <span>Select travel agent</span>
                                )}
                                <ChevronDown
                                  size={16}
                                  className="shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search travel agents..." />
                              <CommandList>
                                <CommandEmpty>
                                  No travel agents found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {travelAgents.map((agent) => (
                                    <CommandItem
                                      key={agent.id}
                                      value={`${agent.name} ${agent.emailId}`}
                                      onSelect={() => {
                                        field.onChange(agent.id);
                                      }}
                                    >
                                      <div className="flex flex-col items-start">
                                        <div>{agent.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {agent.emailId}
                                        </div>
                                      </div>
                                      {field.value === agent.id && (
                                        <Check size={16} className="ml-auto" />
                                      )}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator className="my-4" />
                </div>
                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="flex flex-row items-center justify-between px-4 py-3 bg-muted/40 border-b">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Selected Personnel Details
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Sales In Charge Card */}
                      {form.watch("salesInCharge") && (
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardHeader className="p-3 pb-1 bg-secondary/5 border-b">
                            <CardTitle className="text-sm font-medium flex items-center justify-center w-full">
                              Sales
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="flex flex-col items-center justify-center mt-2">
                              {salesPersonnel.map((salesPerson) => (
                                <div key={salesPerson.id}>
                                  {salesPerson.name}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Reservation In Charge Card - Similar changes */}
                      {form.watch("reservationInCharge") && (
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardHeader className="p-3 pb-1 bg-secondary/5 border-b">
                            <CardTitle className="text-sm font-medium flex items-center justify-center w-full">
                              Reservation
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="flex flex-col items-center justify-center mt-2 ">
                              {reservationPersonnel.map(
                                (reservationPersonnel) => (
                                  <div key={reservationPersonnel.id}>
                                    {reservationPersonnel.name}
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Travel Agent Card - Similar changes */}
                      {form.watch("travelAgent") && (
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <CardHeader className="p-3 pb-1 bg-secondary/5 border-b">
                            <CardTitle className="text-sm font-medium flex items-center justify-center w-full">
                              Travel Agent
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="flex flex-col items-center justify-center mt-2">
                              {travelAgents
                                .filter(
                                  (agent) =>
                                    agent.id === form.watch("travelAgent")
                                )
                                .map((travelAgent) => (
                                  <div key={travelAgent.id}>
                                    {travelAgent.name}
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-4 ">
            <Button variant="outline" type="button" className="px-8">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="px-8">
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
  // ...existing code...
}
