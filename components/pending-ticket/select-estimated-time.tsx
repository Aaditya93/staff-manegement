"use client";

import { useTicketContext } from "./context";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectEstimatedTimeProps {
  defaultTime?: string;
}

export function SelectEstimatedTime({
  defaultTime,
}: SelectEstimatedTimeProps = {}) {
  const { estimatedTime, setEstimatedTime } = useTicketContext();

  // Set initial value when component mounts
  useEffect(() => {
    // If defaultTime is provided, use it; otherwise, keep the current context value
    if (defaultTime) {
      setEstimatedTime(defaultTime);
    }
  }, [defaultTime, setEstimatedTime]);

  const timeOptions = [
    "1H",
    "2H",
    "3H",
    "4H",
    "8H",
    "12H",
    "16H",
    "20H",
    "24H",
  ];

  return (
    <Select
      value={estimatedTime}
      onValueChange={(value) => {
        setEstimatedTime(value);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Time" />
      </SelectTrigger>
      <SelectContent>
        {timeOptions.map((time) => (
          <SelectItem key={time} value={time}>
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
