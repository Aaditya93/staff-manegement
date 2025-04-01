"use client";

import {
  ChevronsUpDown,
  LogOut,
  User,
  Settings,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/sidebar/sidebar";
import ModeToggle from "./theme-button";
import { Badge } from "@/components/ui/badge";

const NavUser = () => {
  const { open } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center gap-3 rounded-md  text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 focus-visible:outline-none">
          <Avatar className="h-9 w-9 border border-sidebar-border/30 shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
            <AvatarFallback className="bg-primary/10 text-primary">
              JD
            </AvatarFallback>
          </Avatar>

          {open && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">John Doe</span>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-medium bg-primary/10 text-primary border-primary/20"
                >
                  Admin
                </Badge>
              </div>
              <span className="truncate text-xs text-sidebar-foreground/60">
                john.doe@example.com
              </span>
            </div>
          )}

          {open && (
            <ChevronsUpDown className="ml-auto size-4 opacity-60 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 rounded-lg p-2"
        side="right"
        align="end"
        sideOffset={10}
        alignOffset={-5}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 p-2 text-left">
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
              <AvatarFallback className="bg-primary/10 text-primary">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">John Doe</span>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-medium bg-primary/10 text-primary border-primary/20"
                >
                  Admin
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                john.doe@example.com
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer">
            <User className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer">
            <Settings className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 cursor-pointer">
            <Shield className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>Role and Permissions</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem className="flex px-2 py-1.5 cursor-pointer">
            <HelpCircle className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Help and Support</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="px-2 py-1.5 cursor-pointer">
            <ModeToggle />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-red-600 focus:text-red-600 focus:bg-red-100/50 dark:focus:bg-red-900/20 cursor-pointer">
          <LogOut className="mr-1 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavUser;
