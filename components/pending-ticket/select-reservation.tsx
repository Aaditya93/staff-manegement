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

// Replace frameworks with reservation staff data
const reservationStaff = [
  {
    value: "68020c32f4e072eb18f21971",
    label: "Victor",
    email: "aaditya9320@outlook.com",
    role: "ReservationStaff",
  },
  {
    value: "6802119bf4e072eb18f2197d",
    label: "Adi Shewale",
    email: "aaditya34590@outlook.com",
    role: "SalesStaff",
  },
];

export function SelectStaff() {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

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
                ? reservationStaff.find((staff) => staff.value === value)?.label
                : "Select agent"}
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
              <CommandEmpty>No agent found.</CommandEmpty>
              <CommandGroup>
                {reservationStaff.map((staff) => (
                  <CommandItem
                    key={staff.value}
                    value={`${staff.label} ${staff.email}`} // Make both name and email searchable
                    onSelect={() => {
                      setValue(staff.value);
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col items-start">
                      <div>{staff.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {staff.email}
                      </div>
                    </div>
                    {value === staff.value && (
                      <Check size={16} strokeWidth={2} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {/* Hidden input to pass the selected value to the form */}
      <input type="hidden" name="reservationInCharge" value={value} />
    </div>
  );
}
