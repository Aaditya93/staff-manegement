"use client";

import React, { useState, useEffect, useRef } from "react";
import { SidebarInset } from "../ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

// Types
import { Conversation, Message, User } from "./chat-types";

// Server Actions
import { searchUsers, createConversation } from "@/actions/chat/search";
import {
  fetchUserConversations,
  fetchConversationMessages,
  sendMessage,
} from "@/actions/chat/conversation";

// Components

import { SearchBar } from "./SearchBar";

import { ConversationItem } from "./ConversationItem ";
import { MessageItem } from "./MessageItem";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";

export const ChatDashboard = ({
  initialConversationId,
  initialMessages = [],
  conversationsData = [],
}: {
  initialConversationId?: string;
  initialMessages?: Message[];
  conversationsData?: Conversation[];
}) => {
  // State
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(initialConversationId || null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(
    Array.isArray(conversationsData) ? conversationsData : []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current conversation from conversations array
  const currentChat =
    conversations.find((c) => c._id === currentConversationId) || null;

  // Format date/time from ISO string
  const formatMessageTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Check if a message was sent by the current user
  const isCurrentUserMessage = (message: Message) => {
    return conversations.some(
      (c) =>
        c._id === currentConversationId &&
        c.participants.every((p) => p._id !== message.senderId._id)
    );
  };
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setIsLoading(false);
    }
  }, [initialMessages]);
  // Scroll to bottom when messages change
  useEffect(() => {
    // Use a small timeout to ensure the DOM has updated
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  // Handle creating a new conversation
  const handleCreateConversation = async (userId: string) => {
    try {
      setIsCreatingConversation(true);
      setIsSearchDropdownOpen(false);

      const { conversationId, error } = await createConversation(userId);

      if (conversationId) {
        const { conversations } = await fetchUserConversations();
        if (conversations) {
          setConversations(conversations);
          setCurrentConversationId(conversationId);
        }
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

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversationId || isSending) return;

    // Store message content and clear input
    const messageContent = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      // Send the message to the server
      const response = await sendMessage(currentConversationId, messageContent);

      // Get the message from the response
      const serverMessage = response.message || response;

      if (serverMessage && serverMessage._id) {
        setMessages((prev) => [
          ...prev,
          {
            ...serverMessage,
            status: "sent",
          },
        ]);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Show error notification or handle error appropriately
    } finally {
      setIsSending(false);
    }
  };
  // Handle click outside search dropdown
  const handleClickOutside = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("[data-search-result]")) {
      setIsSearchDropdownOpen(false);
    }
  };

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <SidebarInset>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-screen overflow-hidden border"
      >
        {/* Left Panel - Conversations List */}
        <ResizablePanel defaultSize={30} minSize={25} className="flex-grow">
          <div className="flex items-center justify-between  border-b">
            <div className="flex items-center gap-2">
              {/* User avatar and header */}
              <ChatHeader conversation={currentChat} isMainHeader={false} />
            </div>
          </div>

          <div>
            {/* Search Bar */}
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              isSearching={isSearching}
              isSearchDropdownOpen={isSearchDropdownOpen}
              setIsSearchDropdownOpen={setIsSearchDropdownOpen}
              searchResults={searchResults}
              handleCreateConversation={handleCreateConversation}
              isCreatingConversation={isCreatingConversation}
              handleClickOutside={handleClickOutside}
            />

            {/* Conversation List */}
            <ScrollArea className="flex-grow h-[calc(100vh-120px)]">
              {isLoading && conversations.length === 0 ? (
                <div className="">
                  {[1, 2, 3, 4].map((item) => (
                    <EmptyState key={item} type="loading" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <EmptyState type="noConversations" />
              ) : (
                conversations.map((conversation, index) => (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={currentConversationId === conversation._id}
                    onSelect={() => setCurrentConversationId(conversation._id)}
                    formatTime={formatMessageTime}
                    isLastItem={index === conversations.length - 1}
                  />
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
                <ChatHeader conversation={currentChat} isMainHeader={true} />

                {/* Messages Area */}
                <ScrollArea className="flex-grow p-4 h-[calc(100vh-10rem)] min-h-[400px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-muted" />
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyState type="noMessages" />
                  ) : (
                    <div className="space-y-4 mb-4 pb-2">
                      <AnimatePresence mode="popLayout">
                        {isLoading ? (
                          <div className="flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-muted" />
                          </div>
                        ) : messages.length === 0 ? (
                          <EmptyState type="noMessages" />
                        ) : (
                          <div className="space-y-4 mb-4 pb-2">
                            <AnimatePresence mode="popLayout">
                              {messages.map((msg, index) => {
                                const isNewestMessage =
                                  index === messages.length - 1;

                                return (
                                  <motion.div
                                    key={msg._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: isNewestMessage ? 600 : 500,
                                      damping: isNewestMessage ? 25 : 30,
                                      // No delay for newest message, small delay for others
                                      delay: isNewestMessage ? 0 : 0.1,
                                    }}
                                    layout
                                  >
                                    <MessageItem
                                      message={msg}
                                      isCurrentUser={isCurrentUserMessage(msg)}
                                      formatTime={formatMessageTime}
                                    />
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                            <div
                              ref={messagesEndRef}
                              className="h-1"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </AnimatePresence>
                      <div
                        ref={messagesEndRef}
                        className="h-1"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </ScrollArea>

                {/* Chat Input */}
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  handleSendMessage={handleSendMessage}
                  isSending={isSending}
                />
              </>
            ) : (
              <EmptyState type="welcomeToChat" />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarInset>
  );
};
