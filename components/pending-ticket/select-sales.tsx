"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { useId, useState, useEffect } from "react";
import { useTicketContext } from "./context";
interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add other fields as needed
}

interface PersonnelInfo {
  name?: string;
  emailId?: string;
}

interface SelectSalesStaffProps {
  staffList: Employee[];
  default?: PersonnelInfo;
}

// ...existing imports and interfaces...

export function SelectSalesStaff({
  staffList,
  default: defaultValue,
}: SelectSalesStaffProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const { setSelectedSalesStaff } = useTicketContext();

  // Find default value by matching email
  useEffect(() => {
    if (defaultValue?.emailId) {
      const matchedStaff = staffList.find(
        (staff) => staff.email === defaultValue.emailId
      );
      if (matchedStaff) {
        setValue(matchedStaff._id.toString());
        // Pass complete staff info instead of just ID
        setSelectedSalesStaff({
          id: matchedStaff._id.toString(),
          name: matchedStaff.name,
          email: matchedStaff.email,
        });
      }
    }
  }, [defaultValue, staffList, setSelectedSalesStaff]);

  const handleSelect = (staffId: string) => {
    setValue(staffId);
    const selectedStaff = staffList.find(
      (staff) => staff._id.toString() === staffId
    );

    if (selectedStaff) {
      // Pass complete staff info instead of just ID
      setSelectedSalesStaff({
        id: staffId,
        name: selectedStaff.name,
        email: selectedStaff.email,
      });
    }
    setOpen(false);
  };

  return (
    <div className="space-y-2 min-w-[200px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? staffList.find((staff) => staff._id === value)?.name
                : defaultValue?.name || "Select Sales Staff"}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={2}
              className="shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
          align="start"
        >
          <Command>
            <CommandInput placeholder="Search by name or email..." />
            <CommandList>
              <CommandEmpty>No sales staff found.</CommandEmpty>
              <CommandGroup>
                {staffList.map((staff) => (
                  <CommandItem
                    key={staff._id}
                    value={`${staff.name} ${staff.email}`}
                    onSelect={() => handleSelect(staff._id.toString())}
                  >
                    <div className="flex flex-col items-start">
                      <div>{staff.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {staff.email}
                      </div>
                    </div>
                    {value === staff._id.toString() && (
                      <Check size={16} strokeWidth={2} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
