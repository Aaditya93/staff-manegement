"use client";
import { Drawer, DrawerTrigger, DrawerContent } from "../ui/drawer";
import { Button } from "../ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { useSession } from "next-auth/react";
export const MonbileNav = () => {
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
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="text-foreground -ml-2 mr-2 h-8 w-8 px-0 text-base hover:bg-accent focus-visible:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="!size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9h16.5m-16.5 6.75h16.5"
            />
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[60svh] p-0 bg-background border-t border-border">
        <div className="overflow-auto p-6">
          <div className="flex flex-col space-y-3">
            <nav className="flex flex-col space-y-4">
              <Link
                href={
                  session.data?.user.role == "TravelAgent"
                    ? `/travel-agent/dashboard/from=${seven}&to=${to}`
                    : `/dashboard/from=${seven}&to=${to}`
                }
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname === "/dashboard"
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                Dashboard
              </Link>
              {/* <Link
                href="/contact-us"
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname?.startsWith("/contact-us")
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                Contact Us
              </Link> */}
              {/* <Link
                href="/about-us"
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname?.startsWith("/about-us")
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                About Us
              </Link> */}
              <Link
                href="/auth/travel-agent/register"
                className={cn(
                  "transition-colors hover:text-primary",
                  pathname?.startsWith("/charts")
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                Travel Agent
              </Link>
            </nav>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default MonbileNav;
