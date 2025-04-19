"use client";

// ** Imports: React & Hooks **
import React, { useState, useEffect } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ** Dropdown Menu Components **
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ** Icons **
import {
  Camera,
  CircleFadingPlus,
  File,
  Image,
  MessageCircle,
  MessageSquareDashed,
  MessageSquareDot,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Settings,
  Smile,
  Star,
  User2,
  UserRound,
  Users,
  Video,
} from "lucide-react";

// ** Server Actions **
import {
  fetchUserConversations,
  fetchConversationMessages,
  sendMessage,
} from "@/actions/chat/conversation";

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
};
type User = {
  _id: string;
  name: string;
  email: string;
  image?: string;
};
// ...existing code...
const menuItems = [
  { title: "Messages", url: "#", icon: MessageCircle },
  { title: "Phone", url: "#", icon: Phone },
  { title: "Status", url: "#", icon: CircleFadingPlus },
];

export const ChatDashboard = () => {
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
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

  // Remove the first useEffect performSearch function entirely, and only keep the second one:

  // Delete this first useEffect (lines ~70-89)
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

      const { success, error } = await sendMessage(
        currentConversationId,
        message.trim()
      );

      if (success) {
        setMessage("");
        // Reload messages to show the new one
        const { messages } = await fetchConversationMessages(
          currentConversationId
        );
        if (messages) {
          setMessages(messages);
        }
      } else if (error) {
        console.error("Error sending message:", error);
      }

      setIsSending(false);
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

  return (
    <>
      <SidebarInset>
        <ResizablePanelGroup
          direction="horizontal"
          className="h-screen overflow-hidden border"
        >
          {/* Left Panel - Chat List */}
          <ResizablePanel defaultSize={30} minSize={25} className="flex-grow">
            <div className="flex flex-col h-screen border-r bg-background">
              {/* Header */}
              <div className="p-3 flex items-center justify-between bg-muted/20 border-b ">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src="https://github.com/rayimanoj8.png" />
                    <AvatarFallback>YU</AvatarFallback>
                  </Avatar>
                  <h2 className="text-sm font-medium">Your Account</h2>
                </div>
                <div className="flex gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border"
                        >
                          <CircleFadingPlus className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Status</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl border"
                    >
                      <DropdownMenuItem>
                        <User2 className="mr-2 h-4 w-4" /> Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" /> New Group
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="mr-2 h-4 w-4" /> Starred Messages
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

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
                  <div className="p-4 text-center text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No conversations found
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
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full border"
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full border"
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full border"
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full border"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border"
                        >
                          <DropdownMenuItem>View contact</DropdownMenuItem>
                          <DropdownMenuItem>
                            Media, links, and docs
                          </DropdownMenuItem>
                          <DropdownMenuItem>Search</DropdownMenuItem>
                          <DropdownMenuItem>
                            Mute notifications
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Block
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-grow p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          Loading messages...
                        </p>
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
                      <div className="space-y-4 mb-4">
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
                              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm border shadow-sm ${
                                isCurrentUserMessage(msg)
                                  ? "bg-primary text-primary-foreground rounded-br-none"
                                  : "bg-secondary text-secondary-foreground rounded-bl-none"
                              }`}
                            >
                              <div>{msg.content[0]}</div>
                              <div
                                className={`text-xs mt-1 text-right ${
                                  isCurrentUserMessage(msg)
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatMessageTime(msg.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Chat Input */}
                  <div className="p-3 flex items-center gap-2 bg-muted/20 rounded-br-lg border-t">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full border"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full border"
                        >
                          <Paperclip className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl border"
                      >
                        <DropdownMenuItem>
                          <Image className="mr-2 h-4 w-4" /> Photos & Videos
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Camera className="mr-2 h-4 w-4" /> Camera
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <File className="mr-2 h-4 w-4" /> Document
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserRound className="mr-2 h-4 w-4" /> Contact
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                      {message.trim() ? (
                        <Send className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
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
