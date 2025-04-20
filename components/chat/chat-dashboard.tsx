"use client";

import { Skeleton } from "@/components/ui/skeleton";

import React, { useState, useEffect, useRef } from "react";
import { searchUsers, createConversation } from "@/actions/chat/search";
import { useDebounce } from "@/hooks/use-debounce";
import { SidebarInset } from "../ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  CheckCheck,
  MessageSquareDashed,
  MessageSquareDot,
  Search,
  Send,
} from "lucide-react";

// ** Server Actions **
import {
  fetchUserConversations,
  fetchConversationMessages,
  sendMessage,
} from "@/actions/chat/conversation";

import { EmojiPickerPopover } from "../mail/emojis";
import { useRouter } from "next/navigation";

// ** Types for Chat Data **
type Conversation = {
  _id: string;
  name?: string;
  isGroup: boolean;
  lastMessage?: {
    _id: string;
    content: string[];
    type: string;
    createdAt: string;
  };
  participants: {
    _id: string;
    name: string;
    image?: string;
  }[];
  updatedAt: string;
  unreadCount: number;
};

// In chat-dashboard.tsx
type Message = {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    image?: string;
  };
  type: string;
  content: string[];
  createdAt: string;
  updatedAt: string;
  seenBy?: {
    // Add this field for tracking read receipts
    userId: string;
    seenAt: string;
  }[];
};
type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
};
// ...existing code...

export const ChatDashboard = ({
  initialConversationId,
  initialMessages = [],
}: // initialConversation = null,
// messageLimit = 150,
{
  initialConversationId?: string;
  initialMessages?: Message[];
  initialConversation?: Conversation | null;
  messageLimit?: number;
}) => {
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  // Add this function to handle creating a new conversation
  const handleCreateConversation = async (userId: string) => {
    try {
      setIsCreatingConversation(true);
      setIsSearchDropdownOpen(false);

      const { conversationId, error } = await createConversation(userId);

      if (conversationId) {
        // Reload conversations with the new one
        const { conversations } = await fetchUserConversations();
        if (conversations) {
          setConversations(conversations);
          // Set the newly created conversation as active
          setCurrentConversationId(conversationId);
        }

        // Clear search
        setSearchQuery("");
      } else if (error) {
        console.error("Error creating conversation:", error);
      }

      setIsCreatingConversation(false);
    } catch (err) {
      console.error("Error creating conversation:", err);
      setIsCreatingConversation(false);
    }
  };
  // Get current conversation from conversations array
  const currentChat =
    conversations.find((c) => c._id === currentConversationId) || null;

  // Load conversations on component mount
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true);
      const { conversations, error } = await fetchUserConversations();

      if (conversations) {
        setConversations(conversations);
        // Set first conversation as active if exists
        if (conversations.length > 0 && !currentConversationId) {
          setCurrentConversationId(conversations[0]._id);
        }
      } else if (error) {
        console.error("Error loading conversations:", error);
      }

      setIsLoading(false);
    }

    loadConversations();
  }, []);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
        return;
      }

      setIsSearching(true);
      const { users, error } = await searchUsers(debouncedSearchTerm);

      if (users) {
        setSearchResults(users);
        setIsSearchDropdownOpen(users.length > 0);
      } else if (error) {
        console.error("Error searching users:", error);
      }

      setIsSearching(false);
    }

    performSearch();
  }, [debouncedSearchTerm]);

  // Keep only this second one (make sure it stays exactly as it is)
  const handleClickOutside = (e: React.MouseEvent) => {
    // Don't close if clicking on a search result item
    if ((e.target as HTMLElement).closest("[data-search-result]")) {
      return;
    }
    setIsSearchDropdownOpen(false);
  };
  const handleSendMessage = async () => {
    if (message.trim() && currentConversationId) {
      setIsSending(true);

      // Create optimistic message to show immediately
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        senderId: {
          _id: "currentUser", // This will be replaced when actual data returns
          name: "You",
          image: undefined,
        },
        type: "text",
        content: [message.trim()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "sending", // Custom status to track message state
      };

      // Add optimistic message to UI immediately with animation class
      setMessages((prev) => [...prev, optimisticMessage]);

      // Clear input right away for better UX
      setMessage("");

      try {
        const { success, error } = await sendMessage(
          currentConversationId,
          optimisticMessage.content[0]
        );

        if (success) {
          // Update optimistic message status or replace with actual message
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === optimisticMessage._id
                ? { ...msg, status: "sent" }
                : msg
            )
          );

          // Optionally fetch to sync with server (can be done less aggressively)
          const { messages: serverMessages } = await fetchConversationMessages(
            currentConversationId
          );
          if (serverMessages) {
            // Replace messages but keep animations for recent ones
            const typedMessages = serverMessages.map((msg) => ({
              ...msg,
              type: msg.type || "text",
            })) as Message[];
            setMessages(typedMessages);
          }
        } else if (error) {
          // Mark message as failed
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === optimisticMessage._id
                ? { ...msg, status: "failed" }
                : msg
            )
          );
          console.error("Error sending message:", error);
        }
      } catch (err) {
        // Mark message as failed
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === optimisticMessage._id
              ? { ...msg, status: "failed" }
              : msg
          )
        );
        console.error("Error sending message:", err);
      } finally {
        setIsSending(false);
      }
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format date/time from ISO string
  const formatMessageTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get display name for a conversation
  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name;
    return conversation.participants[0]?.name || "Unknown";
  };

  // Get avatar image for a conversation
  const getConversationImage = (conversation: Conversation) => {
    if (!conversation.isGroup && conversation.participants[0]?.image) {
      return conversation.participants[0].image;
    }
    return "";
  };

  // Check if a message was sent by the current user
  const isCurrentUserMessage = (message: Message) => {
    // In a real app, compare with current user ID from auth context
    // This is a placeholder logic - replace with actual auth check
    return conversations.some(
      (c) =>
        c._id === currentConversationId &&
        c.participants.every((p) => p._id !== message.senderId._id)
    );
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add this effect to scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <SidebarInset>
        <ResizablePanelGroup
          direction="horizontal"
          className="h-screen overflow-hidden border"
        >
          {/* Left Panel - Chat List */}
          <ResizablePanel defaultSize={30} minSize={25} className="flex-grow">
            <div className="p-3 flex items-center justify-between bg-muted/20 border-b">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage
                    src={conversations[0]?.participants[0]?.image || ""}
                    alt="User avatar"
                  />
                  <AvatarFallback>
                    {conversations[0]?.participants[0]?.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-sm font-medium">
                  {conversations[0]?.participants[0]?.name || "Chat"}
                </h2>
              </div>
            </div>
            <div>
              <div className="p-3 relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search or start new chat"
                    className="pl-9 bg-muted/30 border rounded-xl"
                    value={searchQuery}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchQuery(value);
                      // Don't auto-close dropdown when typing
                      if (value.length >= 2) {
                        setIsSearching(true); // Show "Searching..." while waiting for debounce
                      } else {
                        setIsSearchDropdownOpen(false);
                      }
                    }}
                    onFocus={() => {
                      // Show dropdown if we have a valid search term
                      if (searchQuery.length >= 2) {
                        setIsSearchDropdownOpen(true);
                      }
                    }}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  )}
                </div>
                {/* Search Results Dropdown */}

                {isSearchDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => handleClickOutside(e)}
                    />
                    <div className="absolute z-20 bg-popover shadow-md rounded-md w-full mt-1 border max-h-64 overflow-auto">
                      <div className="p-2">
                        <h4 className="text-sm font-medium px-2 py-1.5 text-muted-foreground">
                          {isSearching ? "Searching..." : "Users"}
                        </h4>

                        {isSearching ? (
                          <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                            Searching for users...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                            No users found
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {searchResults.map((user) => (
                              <button
                                key={user._id}
                                data-search-result
                                onClick={() =>
                                  handleCreateConversation(user._id)
                                }
                                disabled={isCreatingConversation}
                                className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md text-left"
                              >
                                <Avatar className="h-8 w-8 border">
                                  <AvatarImage src={user.image || ""} />
                                  <AvatarFallback>
                                    {user.name?.[0] || user.email[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-sm font-medium truncate">
                                    {user.name || "Unknown User"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Contact List */}
              <ScrollArea className="flex-grow h-[calc(100vh-120px)]">
                {isLoading && conversations.length === 0 ? (
                  <div className="">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className=" p-1 flex items-center justify-between w-full"
                      >
                        <Skeleton className="h-12 w-full ">
                          <Skeleton className="h-10 w-10 rounded-full" />
                        </Skeleton>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <MessageSquareDashed className="h-8 w-8 opacity-50" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  conversations.map((conversation, index) => (
                    <div key={conversation._id}>
                      <button
                        onClick={() =>
                          setCurrentConversationId(conversation._id)
                        }
                        className={`p-3 w-full hover:bg-muted cursor-pointer text-left flex items-center justify-between ${
                          currentConversationId === conversation._id
                            ? "bg-muted/50"
                            : ""
                        }`}
                      >
                        <div className="flex gap-3 items-center">
                          <Avatar className="border">
                            <AvatarImage
                              src={getConversationImage(conversation)}
                            />
                            <AvatarFallback>
                              {getConversationName(conversation)[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex justify-between w-full">
                              <p className="text-sm font-medium leading-none">
                                {getConversationName(conversation)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {conversation.lastMessage?.content[0] ||
                                "No messages yet"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            {conversation.lastMessage
                              ? formatMessageTime(
                                  conversation.lastMessage.createdAt
                                )
                              : formatMessageTime(conversation.updatedAt)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-green-500 text-white border">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                      {index < conversations.length - 1 && (
                        <Separator className="mx-12" />
                      )}
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Chat Window */}
          <ResizablePanel defaultSize={70} minSize={40}>
            <div className="flex flex-col h-screen bg-gradient-to-b from-muted/20 to-background rounded-r-lg">
              {currentChat ? (
                <>
                  {/* Chat Header */}

                  {/* Chat Header - Enhanced with participant info */}
                  <div className="h-16 border-b bg-muted/20 flex items-center justify-between px-4 rounded-tr-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="border">
                        <AvatarImage src={getConversationImage(currentChat)} />
                        <AvatarFallback>
                          {getConversationName(currentChat)[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {getConversationName(currentChat)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea
                    className="flex-grow p-4 h-[calc(100vh-10rem)]"
                    viewportClassName="min-h-[400px]"
                  >
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <div className="flex flex-col space-y-3 w-full max-w-md">
                          {/* Loading animation with pulsing chat bubbles */}
                          <div className="flex justify-start">
                            <div className="bg-secondary/40 animate-pulse h-10 w-48 rounded-2xl rounded-bl-none"></div>
                          </div>
                          <div className="flex justify-end">
                            <div className="bg-primary/40 animate-pulse h-10 w-32 rounded-2xl rounded-br-none"></div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-secondary/40 animate-pulse h-10 w-40 rounded-2xl rounded-bl-none"></div>
                          </div>
                          <div className="flex justify-end">
                            <div className="bg-primary/40 animate-pulse h-10 w-56 rounded-2xl rounded-br-none"></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className="h-3 w-3 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="h-3 w-3 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="h-3 w-3 bg-primary/60 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-muted-foreground">
                          <MessageSquareDashed className="mx-auto h-12 w-12 mb-2 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">
                            Start a new conversation
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-4 pb-2">
                        {messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex ${
                              isCurrentUserMessage(msg)
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm border shadow-sm 
              ${
                isCurrentUserMessage(msg)
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-secondary text-secondary-foreground rounded-bl-none"
              } 
              ${
                msg._id.startsWith("temp-")
                  ? "animate-slide-in-up opacity-90"
                  : "animate-fade-in"
              }
              ${msg.status === "sending" ? "opacity-80" : ""}
              ${msg.status === "failed" ? "border-red-500" : ""}
            `}
                              style={{
                                animationDuration: "0.3s",
                                animationFillMode: "forwards",
                              }}
                            >
                              <div className="break-words">
                                {msg.content[0]}
                              </div>
                              <div
                                className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                                  isCurrentUserMessage(msg)
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <span>{formatMessageTime(msg.createdAt)}</span>

                                {/* Show different indicators based on message status */}
                                {isCurrentUserMessage(msg) && (
                                  <span className="flex items-center ml-1">
                                    {msg.status === "sending" ? (
                                      <span className="h-3 w-3 relative">
                                        <span className="absolute animate-ping h-2 w-2 rounded-full bg-blue-300 opacity-75"></span>
                                        <span className="absolute h-3 w-3 rounded-full bg-blue-400"></span>
                                      </span>
                                    ) : msg.status === "failed" ? (
                                      <span className="text-red-500 text-xs">
                                        ⚠️
                                      </span>
                                    ) : msg.seenBy && msg.seenBy.length > 0 ? (
                                      <CheckCheck className="h-3 w-3 text-blue-400" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* This empty div serves as a marker for scrolling to the bottom */}
                        <div ref={messagesEndRef} className="h-1" />
                      </div>
                    )}
                  </ScrollArea>
                  {/* Chat Input */}
                  <div className="p-3 flex items-center gap-2 bg-muted/20 rounded-br-lg border-t">
                    <EmojiPickerPopover />
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
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-6">
                  <div>
                    <MessageSquareDot className="mx-auto h-16 w-16 mb-4 opacity-30" />
                    <h3 className="text-xl font-medium mb-2">
                      Welcome to Chat
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Select a conversation from the list to start messaging or
                      create a new one.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </>
  );
};
