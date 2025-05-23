"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { type DialogProps } from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface Agent {
  _id: string;
  name: string;
  email: string;
}

interface CommandMenuProps extends DialogProps {
  agents?: Agent[];
}

const CommandMenu = ({ agents = [], ...props }: CommandMenuProps) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-10 w-full justify-start border border-input bg-background px-4 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground rounded-md sm:pr-12 md:w-80 lg:w-96 flex items-center gap-2"
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="hidden lg:inline-flex">Search travel agents...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-50 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search by name or email..." />
        <CommandList className="min-h-[400px]">
          <CommandEmpty>No agents found.</CommandEmpty>
          <CommandGroup heading="Travel Agents">
            {agents.map((agent) => (
              <CommandItem
                key={agent._id}
                // Allow searching by both name and email
                value={`${agent.name || ""} ${agent.email}`}
                onSelect={() => {
                  runCommand(() => router.push(`/agent/${agent._id}`));
                }}
              >
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">
                      {agent.name && agent.name !== "null" ? (
                        agent.name
                      ) : (
                        <span className="italic text-muted-foreground">
                          No name
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {agent.email}
                    </span>
                  </div>
                  {(!agent.name || agent.name === "null") && (
                    <Badge variant="outline" className="w-fit mt-1 text-xs">
                      Missing name
                    </Badge>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
export default CommandMenu;
