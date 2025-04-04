"use client";
import React, { useState, ReactNode } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/sidebar/sidebar";
import { LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";
import { GrAnalytics } from "react-icons/gr";
import { LogOut } from "lucide-react";

import NavUser from "./nav-user";
export function SidebarDemo({ children }: { children: ReactNode }) {
  const links = [
    {
      label: "Mail",
      href: "#",
      icon: <Mail className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <LayoutDashboard className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },

    {
      label: "Reports",
      href: "#",
      icon: (
        <GrAnalytics className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <LogOut className="text-sidebar-foreground h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-sidebar flex-1 w-screen mx-auto border border-sidebar-border overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <NavUser />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 w-full h-full overflow-hidden">
        <div className="p-0 ">{children}</div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-sidebar-foreground py-1 relative z-20"
    >
      <div className="flex aspect-square size-10 items-center  justify-center rounded-lg  boarder border-sidebar-border bg-background ">
        <Image
          src="/logo.png"
          alt=""
          className="rounded-xl"
          width={50}
          height={50}
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-sidebar-foreground  whitespace-pre"
      >
        Victoria Tours
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex items-center text-sm text-sidebar-foreground py-1 relative z-20"
    >
      <div className="flex aspect-square size-7 items-center  justify-center rounded-lg  boarder border-sidebar-border  bg-background ">
        <Image
          src="/logo.png"
          alt=""
          className="rounded-xl"
          width={50}
          height={50}
        />
      </div>
    </Link>
  );
};
