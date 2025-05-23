"use client";

import { ChevronsUpDown, Edit, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { SignOut } from "@/actions/auth/sign-out";

import ModeToggle from "@/components/sidebar/theme-button";
import Link from "next/link";

const NavUser = () => {
  const { isMobile } = useSidebar();
  const session = useSession();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={session.data?.user.image ?? ""}
                  alt={session.data?.user.name ?? ""}
                />
                <AvatarFallback className="rounded-lg">
                  {session.data?.user?.name?.slice(0, 2)?.toUpperCase() || ""}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {session.data?.user.name}
                </span>
                <span className="truncate text-xs">
                  {session.data?.user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={session.data?.user.image ?? ""}
                    alt={session.data?.user.name ?? ""}
                  />
                  <AvatarFallback className="rounded-lg">
                    {session.data?.user?.name?.slice(0, 2)?.toUpperCase() || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {session.data?.user.name}
                  </span>
                  <span className="truncate text-xs">
                    {session.data?.user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ModeToggle />
            </DropdownMenuItem>
            {session.data?.user.role !== "TravelAgent" && (
              <DropdownMenuItem asChild>
                <Link href="/edit-profile">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className=" text-red-600 " onClick={SignOut}>
              <LogOut className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default NavUser;
