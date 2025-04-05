"use client";

import * as React from "react";
import { Smile } from "lucide-react";
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
} from "@/components/ui/emoji-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmojiPickerProps {
  onEmojiSelect?: (emoji: { emoji: string }) => void;
}

export function EmojiPickerPopover({ onEmojiSelect }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleEmojiSelect = (emoji: { emoji: string }) => {
    if (onEmojiSelect) {
      onEmojiSelect(emoji);
    }
    setOpen(false); // Close the popover after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Smile className="h-4 w-4" />
              <span className="sr-only">Add emoji</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">Add emoji</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-full p-0" align="start" sideOffset={5}>
        <EmojiPicker
          className="h-[326px] border-none shadow-none"
          onEmojiSelect={handleEmojiSelect}
        >
          <EmojiPickerSearch />
          <EmojiPickerContent />
        </EmojiPicker>
      </PopoverContent>
    </Popover>
  );
}
