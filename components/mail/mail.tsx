"use client";

import * as React from "react";
import { useState } from "react";
import {
  Archive,
  ArchiveX,
  File,
  Inbox,
  Search,
  Send,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TooltipProvider } from "../ui/tooltip";
import { AccountSwitcher } from "./account-switcher";
import { MailDisplay } from "./mail-display";
import { MailList } from "./mail-list";
import { Nav } from "./nav";

import { type Mail } from "./data";
import { useMail } from "./use-mails";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { SessionProvider } from "next-auth/react";
import { ComposeButton } from "./compose-button";

interface MailProps {
  currentFolder: string;
  currentStatus: string;
  mails: Mail[];
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
  inboxNumber?: number;
}

export function Mail({
  mails,
  inboxNumber,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  currentFolder,
  currentStatus,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [mail] = useMail();
  const router = useRouter();
  const initialTab = currentStatus === "unread" ? "unread" : "all";

  // Add state for search query
  const [searchQuery, setSearchQuery] = useState("");

  // Filter mails based on search query
  const filteredMails = mails.filter((item) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // Check various email fields for the search query
    return (
      // Search in email addresses
      (item.email && item.email.toLowerCase().includes(query)) ||
      (item.subject && item.subject.toLowerCase().includes(query)) ||
      (item.text && item.text.toLowerCase().includes(query))
    );
  });

  // Create a filtered list of unread emails
  const filteredUnreadMails = filteredMails.filter((item) => !item.read);

  // Handle tab change
  const handleTabChange = (value: string) => {
    // Extract the current folder from the URL or use the currentFolder prop
    const folder = currentFolder || "inbox";

    // Navigate to the appropriate URL
    if (value === "unread") {
      router.push(`/mail/${inboxNumber}/${folder}/unread`);
    } else {
      router.push(`/mail/${inboxNumber}/${folder}/read`);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
  };

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
            sizes
          )}`;
        }}
        className="h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`;
          }}
          onResize={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`;
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          {/* Navigation panel content remains the same */}
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <SessionProvider>
              <AccountSwitcher isCollapsed={isCollapsed} />
            </SessionProvider>
          </div>
          <div
            className={cn(
              "flex items-center ml-2 py-2",
              isCollapsed && "hidden"
            )}
          >
            <ComposeButton />
          </div>

          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Inbox",
                label: "",
                icon: Inbox,
                variant: currentFolder === "inbox" ? "default" : "ghost",
                href: `/mail/${inboxNumber}/inbox/read`,
              },
              {
                title: "Drafts",
                label: "",
                icon: File,
                variant: currentFolder === "drafts" ? "default" : "ghost",
                href: `/mail/${inboxNumber}/drafts/read`,
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                variant: currentFolder === "sent" ? "default" : "ghost",
                href: `/mail/${inboxNumber}/sent/read`,
              },
              {
                title: "Junk",
                label: "",
                icon: ArchiveX,
                variant: currentFolder === "junk" ? "default" : "ghost",
                href: `/mail/${inboxNumber}/junk/read`,
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: currentFolder === "trash" ? "default" : "ghost",
                href: `/mail/${inboxNumber}/trash/read`,
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                variant: currentFolder === "archive" ? "default" : "ghost",
                href: `/mail/${inboxNumber}/archive/read`,
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue={initialTab} onValueChange={handleTabChange}>
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">
                {currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)}
              </h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email, subject, or content"
                    className="pl-8 pr-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Clear search"
                      onClick={clearSearch}
                      className="absolute right-2 top-2.5 h-4 w-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    ></Button>
                  )}
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList
                items={filteredMails}
                emptyState={
                  searchQuery ? (
                    <div className="flex h-[450px] items-center justify-center p-8">
                      <div className="flex flex-col items-center text-center">
                        <Search className="h-8 w-8  mb-4" />
                        <h3 className="text-lg font-medium">
                          No results found
                        </h3>
                        <p className="text-sm  mb-4">
                          No emails match your search for &ldquo;{searchQuery}
                          &rdquo;
                        </p>
                        <Button variant={"ghost"} onClick={clearSearch}>
                          Clear search
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[450px] items-center justify-center p-8">
                      <div className="flex flex-col items-center text-center">
                        <Inbox className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No emails</h3>
                        <p className="text-sm text-muted-foreground">
                          Your {currentFolder} folder is empty
                        </p>
                      </div>
                    </div>
                  )
                }
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList
                items={filteredUnreadMails}
                emptyState={
                  searchQuery ? (
                    <div className="flex h-[450px] items-center justify-center p-8">
                      <div className="flex flex-col items-center text-center">
                        <Search className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                          No results found
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          No unread emails match your search for &ldquo;
                          {searchQuery}&rdquo;
                        </p>
                        <button
                          onClick={clearSearch}
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[450px] items-center justify-center p-8">
                      <div className="flex flex-col items-center text-center">
                        <Inbox className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                          No unread emails
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You&apos;ve read all your emails in this folder
                        </p>
                      </div>
                    </div>
                  )
                }
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay
            inboxNumber={inboxNumber}
            mail={
              filteredMails.find((item) => item.id === mail.selected) || null
            }
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
