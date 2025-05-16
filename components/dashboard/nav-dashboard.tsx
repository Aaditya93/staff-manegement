"use client";

import React, { Dispatch, SetStateAction } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { Checkbox } from "@/components/ui/checkbox";

interface NavMainProps {
  items: {
    title: string;
    icon: LucideIcon | React.ComponentType;
    isActive?: boolean;
    items?: {
      title: string;
      key: string;
      items: { title: string }[];
    }[];
  }[];
  searchSelections: string;
  setSearchSelections: Dispatch<SetStateAction<string>>;
}

const NavDashboard = ({
  items,
  searchSelections,
  setSearchSelections,
}: NavMainProps) => {
  const renderSearchSection = (items: { title: string; key: string }[]) => {
    return (
      <div className="space-y-2 p-2">
        {items.map((item) => (
          <div
            key={item.key || item.title}
            className="flex items-center space-x-2"
          >
            <Checkbox
              id={item.title}
              checked={searchSelections === item.key} // Changed from includes
              onCheckedChange={(checked) => {
                if (checked) {
                  setSearchSelections(item.key);
                } else {
                  setSearchSelections("fullName");
                }
              }}
            />
            <label
              htmlFor={item.title}
              className="text-sm font-medium leading-none"
            >
              {item.title}
            </label>
          </div>
        ))}
      </div>
    );
  };
  // Types for filter items

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.title === "Search" &&
                        renderSearchSection(item.items)}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NavDashboard;
