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
import { useId, useState } from "react";
// Remove context import if no longer needed for other purposes
// import { useTicketContext } from "./context";

// Define Employee interface
interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
  country?: string;
  // Add other fields as needed
}

// Remove PersonnelInfo if default is handled by the form
// interface PersonnelInfo {
//   name?: string;
//   emailId?: string;
// }

interface SelectChangeStaffProps {
  staffList: Employee[];
  // Props for react-hook-form control
  value?: string; // The selected staff ID
  onChange?: (value: string) => void; // Function to call when selection changes
  placeholder?: string;
  disabled?: boolean;
}

export function SelectChangeStaff({
  staffList,
  value, // Use the passed value
  onChange, // Use the passed onChange handler
  placeholder = "Select Change Staff",
  disabled = false,
}: SelectChangeStaffProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  // Remove internal value state and context usage related to selection
  // const [value, setValue] = useState<string>("");
  // const { setSelectedReservationStaff } = useTicketContext();

  // Remove useEffect related to default value, form will handle it
  // useEffect(() => { ... });

  const handleSelect = (staffId: string) => {
    // Call the onChange handler passed from the form
    if (onChange) {
      onChange(staffId);
    }
    // Remove context update if context is not used here anymore
    // const selectedStaff = staffList.find(...)
    // setSelectedReservationStaff(...)
    setOpen(false);
  };

  const selectedStaffName = staffList.find(
    (staff) => staff._id === value
  )?.name;

  return (
    <div className="space-y-2 min-w-[200px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || staffList.length === 0} // Disable if no staff or explicitly disabled
            className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {/* Use selectedStaffName derived from the value prop */}
              {selectedStaffName || placeholder}
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
              <CommandEmpty>No reservation staff found.</CommandEmpty>
              <CommandGroup>
                {staffList.map((staff) => (
                  <CommandItem
                    key={staff._id}
                    value={`${staff.name} ${staff.email}`} // Keep value for search functionality
                    onSelect={() => handleSelect(staff._id.toString())}
                  >
                    <div className="flex flex-col items-start">
                      <div>{staff.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {staff.email}
                      </div>
                    </div>
                    {/* Check against the value prop */}
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
