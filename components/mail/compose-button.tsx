"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { ComposeMailDialog } from "./compose-mail-dialog";
import { usePathname } from "next/navigation";

export function ComposeButton() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Extract inbox number from the URL
  const match = pathname.match(/\/mail\/(\d+)/);
  const inboxNumber = match ? parseInt(match[1], 10) : 0;

  // Add scroll listener to add shadow effect when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div>
        <Button
          onClick={() => setOpen(true)}
          className={`w-full gap-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${
            scrolled ? "shadow-lg" : "shadow-md"
          }`}
          size="lg"
          variant="default"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          <span>Compose</span>
        </Button>
      </div>

      {/* Remove the wrapping div to avoid positioning issues */}
      <ComposeMailDialog
        open={open}
        onOpenChange={setOpen}
        inboxNumber={inboxNumber}
      />
    </>
  );
}
