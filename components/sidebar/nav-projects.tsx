"use client"



import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,

  SidebarMenuButton,
  SidebarMenuItem,

} from "@/components/ui/sidebar"
import { IconType } from "react-icons";
export const NavProjects = ({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: IconType
  }[]
}) =>{


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          
          </SidebarMenuItem>
        ))}
    
      </SidebarMenu>
    </SidebarGroup>
  )
}
