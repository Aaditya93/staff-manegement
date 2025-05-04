"use client";

import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

export const MainNav = () => {
  const pathname = usePathname();
  const session = useSession();
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const sevendaysAgo = new Date(today);
  sevendaysAgo.setDate(today.getDate() - 7);

  const seven = sevendaysAgo.toISOString().split("T")[0];

  const to = today.toISOString().split("T")[0];
  return (
    <div className="mr-4 hidden md:flex">
      <div className="relative w-12 h-12  pl-2 ">
        <Image
          src="/logo.png"
          alt="Victoria Tours Logo"
          fill
          className="object-contain p-1"
          priority
        />
      </div>
      <Link href="/home" className="mr-4 flex items-center gap-2 lg:mr-6">
        <span className="hidden mr-4 font-bold lg:inline-block text-foreground">
          Victoria Tours
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Link
          href={
            session.data?.user.role == "TravelAgent"
              ? `/travel-agent/dashboard/from=${seven}&to=${to}`
              : `/dashboard/from=${seven}&to=${to}`
          }
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/dashboard" || pathname === "/travel-agent/dashboard"
              ? "text-primary font-medium"
              : "text-muted-foreground"
          )}
        >
          Dashboard
        </Link>

        <Link
          href="/auth/travel-agent/register"
          className={cn(
            "transition-colors hover:text-primary",
            pathname?.startsWith("/auth/travel-agent/register")
              ? "text-primary font-medium"
              : "text-muted-foreground"
          )}
        >
          Travel Agent
        </Link>
      </nav>
    </div>
  );
};

export default MainNav;
