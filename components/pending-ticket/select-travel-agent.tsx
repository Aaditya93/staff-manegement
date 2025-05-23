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

// Define TravelAgent interface
interface TravelAgent {
  _id: string;
  name: string;
  email: string;
  // Add other travel agent fields as needed
}

interface PersonnelInfo {
  name?: string;
  emailId?: string;
}

interface SelectTravelAgentProps {
  travelAgentList: TravelAgent[];
  default?: PersonnelInfo;
}

export function SelectTravelAgent({
  travelAgentList,
  default: defaultValue,
}: SelectTravelAgentProps) {
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  const { setSelectedTravelAgent } = useTicketContext();

  // Find default value by matching email
  useEffect(() => {
    if (defaultValue?.emailId) {
      const matchedAgent = travelAgentList.find(
        (agent) => agent.email === defaultValue.emailId
      );
      if (matchedAgent) {
        setValue(matchedAgent._id.toString());
        // Pass complete agent info instead of just ID
        setSelectedTravelAgent({
          id: matchedAgent._id.toString(),
          name: matchedAgent.name,
          email: matchedAgent.email,
        });
      }
    }
  }, [defaultValue, travelAgentList, setSelectedTravelAgent]);

  const handleSelect = (agentId: string) => {
    setValue(agentId);
    const selectedAgent = travelAgentList.find(
      (agent) => agent._id.toString() === agentId
    );

    if (selectedAgent) {
      // Pass complete agent info instead of just ID
      setSelectedTravelAgent({
        id: agentId,
        name: selectedAgent.name,
        email: selectedAgent.email,
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
                ? travelAgentList.find((agent) => agent._id === value)?.name
                : defaultValue?.name || "Select Travel Agent"}
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
              <CommandEmpty>No travel agents found.</CommandEmpty>
              <CommandGroup>
                {travelAgentList.map((agent) => (
                  <CommandItem
                    key={agent._id}
                    value={`${agent.name} ${agent.email}`}
                    onSelect={() => handleSelect(agent._id.toString())}
                  >
                    <div className="flex flex-col items-start">
                      <div>{agent.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {agent.email}
                      </div>
                    </div>
                    {value === agent._id.toString() && (
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
