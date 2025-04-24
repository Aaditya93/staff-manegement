"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSession } from "next-auth/react";
import { Mail } from "lucide-react";

interface AccountSwitcherProps {
  isCollapsed: boolean;
}

export function AccountSwitcher({ isCollapsed }: AccountSwitcherProps) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const accounts = session?.data?.user?.accounts || [];

  // Find the current account index from the URL
  const match = pathname.match(/\/mail\/(\d+)/);
  const currentAccountIndex = match ? parseInt(match[1], 10) : 0;

  // Set the selected account based on the URL
  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    accounts[currentAccountIndex]?.email || accounts[0]?.email || ""
  );

  // Handle account selection change
  const handleAccountChange = (email: string) => {
    setSelectedAccount(email);

    // Find the index of the selected account
    const newIndex = accounts.findIndex((account) => account.email === email);

    if (newIndex !== -1) {
      // Replace the current index in the URL with the new index
      const newPath = pathname.replace(/\/mail\/\d+/, `/mail/${newIndex}`);
      router.push(newPath);
    }
  };

  return (
    <Select value={selectedAccount} onValueChange={handleAccountChange}>
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto"
        )}
        aria-label="Select account"
      >
        {isCollapsed ? (
          <Mail className="h-4 w-4" />
        ) : (
          <SelectValue placeholder="Select an account">
            <span>{selectedAccount}</span>
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account, index) => (
          <SelectItem key={account.email} value={account.email}>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0" />
              {account.email}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
