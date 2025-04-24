import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { EmojiPickerPopover } from "../mail/emojis";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  handleSendMessage: () => void;
  isSending: boolean;
}

export function ChatInput({
  message,
  setMessage,
  handleSendMessage,
  isSending,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: { emoji: string }) => {
    setMessage(message + emoji.emoji);
  };

  return (
    <div className="p-3 flex items-center gap-2 bg-muted/20 rounded-br-lg border-t">
      <EmojiPickerPopover onEmojiSelect={handleEmojiSelect} />
      <div className="relative flex-grow">
        <Input
          className="rounded-full pl-4 pr-10 py-5 bg-muted/30 border"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSending}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90 border"
        onClick={handleSendMessage}
        disabled={isSending || !message.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
