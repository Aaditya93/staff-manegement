"use client";
import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, usePathname } from "next/navigation";

const DateRangePicker = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [openFromDatePicker, setOpenFromDatePicker] = React.useState(false);
  const [openToDatePicker, setOpenToDatePicker] = React.useState(false);

  const [fromDate, setFromDate] = React.useState<Date | undefined>(
    new Date(2024, 0, 20)
  );
  const [toDate, setToDate] = React.useState<Date | undefined>(
    new Date(2024, 1, 9)
  );

  // Update URL when dates change
  const updateURL = (from: Date | undefined, to: Date | undefined) => {
    if (from && to) {
      const fromStr = format(from, "yyyy-MM-dd");
      const toStr = format(to, "yyyy-MM-dd");
      const newUrl = `/travel-agent/dashboard/from=${fromStr}&to=${toStr}`;
      router.push(newUrl);
    }
  };

  // Handle from date change
  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    updateURL(date, toDate);
    setOpenFromDatePicker(false);
  };

  // Handle to date change
  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    updateURL(fromDate, date);
    setOpenToDatePicker(false);
  };

  // Load initial dates from pathname
  React.useEffect(() => {
    if (pathname) {
      const matches = pathname.match(/from=([^&]+)&to=([^&]+)/);
      if (matches && matches[1] && matches[2]) {
        setFromDate(new Date(matches[1]));
        setToDate(new Date(matches[2]));
      }
    }
  }, [pathname]);

  return (
    <div className="flex gap-4">
      {/* From Date Picker */}
      <div className="grid gap-2">
        <Popover
          open={openFromDatePicker}
          onOpenChange={() => setOpenFromDatePicker(true)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? (
                format(fromDate, "LLL dd, y")
              ) : (
                <span>Start date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={handleFromDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* To Date Picker */}
      <div className="grid gap-2">
        <Popover
          open={openToDatePicker}
          onOpenChange={() => setOpenToDatePicker(true)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, "LLL dd, y") : <span>End date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={handleToDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangePicker;
