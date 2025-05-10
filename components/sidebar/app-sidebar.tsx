"use client";

import * as React from "react";
import { LifeBuoy, Send, SquareTerminal } from "lucide-react";
import { CiMail } from "react-icons/ci";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { CiViewTable } from "react-icons/ci";
import { GoReport } from "react-icons/go";
import { BsListTask } from "react-icons/bs";
import Image from "next/image";
import { TfiPieChart } from "react-icons/tfi";
import { NavProjects } from "./nav-projects";
import { CiChat1 } from "react-icons/ci";
import NavUser from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
const today = new Date();
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);
const sevendaysAgo = new Date(today);
sevendaysAgo.setDate(today.getDate() - 7);

const seven = sevendaysAgo.toISOString().split("T")[0];

const to = today.toISOString().split("T")[0];
const Admindata = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Agent Platform",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Admin Panel",
          url: "/agent-platform/admin-panel",
        },
        {
          title: "Visa Letter Prices",
          url: "/agent-platform/visa-letter-price/10",
        },
        {
          title: "Immgration Prices",
          url: `/agent-platform/immigration-price/10`,
        },
        {
          title: "A-Payment",
          url: `/agent-platform/payment/6777bb039da64c84fb251323/from=${seven}&to=${to}`,
        },
        {
          title: "I-Payment",
          url: `/agent-platform/payment/immigration/Hanoi/from=${seven}&to=${to}`,
        },
        {
          title: "Billing",
          url: `/agent-platform/billing/677b88cc3c6259f5025f6645/from=${seven}&to=${to}`,
        },
        {
          title: "Upload Excel",
          url: "/agent-platform/upload-excel",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  Upload: [
    {
      name: "Mail",
      url: "/mail/0/inbox/all/10",
      icon: CiMail,
    },
    {
      name: "Dashboard",
      url: `/dashboard/from=${seven}&to=${to}`,
      icon: CiViewTable,
    },
    {
      name: "Ticket",
      url: "/pending-tickets",
      icon: BsListTask,
    },
    {
      name: "Messages",
      url: "/chat/none",
      icon: CiChat1,
    },
    {
      name: "Complaints",
      url: `/report`,
      icon: GoReport,
    },
    {
      name: "Admin Panel",
      url: `/admin-panel`,
      icon: MdOutlineAdminPanelSettings,
    },

    {
      name: "Report",
      url: `/admin-report/from=${seven}&to=${to}`,
      icon: TfiPieChart,
    },
  ],
};

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const user = useSession();
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Agent Platform",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Admin Panel",
            url: "/agent-platform/admin-panel",
          },
          {
            title: "Visa Letter Prices",
            url: "/agent-platform/visa-letter-price/10",
          },
          {
            title: "Immgration Prices",
            url: `/agent-platform/immigration-price/10`,
          },
          {
            title: "A-Payment",
            url: `/agent-platform/payment/6777bb039da64c84fb251323/from=${seven}&to=${to}`,
          },
          {
            title: "I-Payment",
            url: `/agent-platform/payment/immigration/Hanoi/from=${seven}&to=${to}`,
          },
          {
            title: "Billing",
            url: `/agent-platform/billing/677b88cc3c6259f5025f6645/from=${seven}&to=${to}`,
          },
          {
            title: "Upload Excel",
            url: "/agent-platform/upload-excel",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    Upload: [
      {
        name: "Mail",
        url: "/mail/0/inbox/all/10",
        icon: CiMail,
      },
      {
        name: "Dashboard",
        url: `/dashboard/from=${seven}&to=${to}`,
        icon: CiViewTable,
      },
      {
        name: "Ticket",
        url: "/pending-tickets",
        icon: BsListTask,
      },
      {
        name: "Messages",
        url: "/chat/none",
        icon: CiChat1,
      },
      {
        name: "Complaints",
        url: `/report`,
        icon: GoReport,
      },
      {
        name: "Admin Panel",
        url: `/admin-panel`,
        icon: MdOutlineAdminPanelSettings,
      },

      {
        name: "Report",
        url: `/employee-report/${user.data?.user.id}/from=${seven}&to=${to}`,
        icon: TfiPieChart,
      },
    ],
  };
  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center  justify-center rounded-lg bg-primary-foreground text-sidebar-primary-foreground">
                  <Image
                    src="/logo.png"
                    alt="logo"
                    className="rounded-xl"
                    width={50}
                    height={50}
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Victoria Tours</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {user.data?.user.role === "Admin" ? (
          <NavProjects projects={Admindata.Upload} />
        ) : (
          <NavProjects projects={data.Upload} />
        )}

        {/* <NavMain items={data.navMain} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};
export default AppSidebar;
