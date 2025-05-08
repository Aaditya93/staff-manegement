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
import { sendMessage } from "@/actions/chat/conversation";

// Components

import { SearchBar } from "./SearchBar";

import { ConversationItem } from "./ConversationItem ";
import { MessageItem } from "./MessageItem";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
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
    let intervalId: NodeJS.Timeout | undefined;

    if (currentConversationId) {
      // Start polling when a conversation is active
      intervalId = setInterval(() => {
        console.log("Refreshing chat data..."); // Optional: for debugging
        router.refresh();
      }, 2000); // Refresh every 2 seconds
    }

    // Cleanup function to clear the interval
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentConversationId, router]);
  // Add this consolidated effect
  useEffect(() => {
    // Set loading to false when we have either conversations or messages
    if (
      (initialConversationId &&
        initialMessages &&
        initialMessages.length > 0) ||
      conversations.length > 0
    ) {
      setIsLoading(false);
    }

    // Update current conversation and messages when initialConversationId changes
    if (initialConversationId) {
      setCurrentConversationId(initialConversationId);
      setMessages(initialMessages);
    }
  }, [initialConversationId, initialMessages, conversations]);

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
  // Update to properly handle the new conversation
  const handleCreateConversation = async (userId: string) => {
    try {
      setIsCreatingConversation(true);
      setIsSearchDropdownOpen(false);

      const { conversationId, error } = await createConversation(userId);

      if (error) {
        console.error("Error creating conversation:", error);
        return;
      }

      if (conversationId) {
        // Navigate to the new conversation
        router.replace(`/chat/${conversationId}`);
      }
    } catch (err) {
      console.error("Error creating conversation:", err);
    } finally {
      setIsCreatingConversation(false);
    }
  };

  // ...existing code...
  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversationId || isSending) return;

    // Store message content and clear input immediately
    const messageContent = message.trim();
    setMessage("");

    // Create a temporary message with pending status and local ID
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      content: [messageContent],
      senderId: { _id: "current-user" }, // Will be replaced with actual data
      conversationId: currentConversationId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending" as const,
    };

    // Add the optimistic message
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send the actual message
    setIsSending(true);
    try {
      const response = await sendMessage(currentConversationId, messageContent);
      const serverMessage = response.message || response;

      if (serverMessage && serverMessage._id) {
        // Replace the temporary message with the server response
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId ? { ...serverMessage, status: "sent" } : msg
          )
        );
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      // Mark the message as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };
  // ...existing code...
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
                <div className=""></div>
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
                        {messages.map((msg, index) => {
                          const isNewestMessage = index === messages.length - 1;
                          const isPending = msg.status === "pending";
                          const isFailed = msg.status === "failed";

                          return (
                            <motion.div
                              key={msg._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                x: 0,
                              }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{
                                type: "spring",
                                stiffness: isNewestMessage ? 700 : 500,
                                damping: isNewestMessage ? 22 : 30,
                                mass: isNewestMessage ? 0.8 : 1,
                                delay: isNewestMessage ? 0 : 0.1,
                              }}
                              className={
                                isPending || isFailed ? "relative" : ""
                              }
                              layout
                            >
                              <MessageItem
                                message={msg}
                                isCurrentUser={isCurrentUserMessage(msg)}
                                formatTime={formatMessageTime}
                                isFirstMessage={index === 0}
                                status={msg.status}
                              />

                              {isPending && (
                                <motion.div
                                  className="absolute bottom-1 right-1 text-xs text-muted-foreground"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "easeInOut",
                                  }}
                                ></motion.div>
                              )}

                              {isFailed && (
                                <div className="absolute bottom-1 right-1 text-xs text-destructive flex items-center gap-1">
                                  <span>Failed</span>
                                  <button
                                    onClick={() => {
                                      const failedContent = msg.content[0];
                                      // Remove failed message
                                      setMessages((prev) =>
                                        prev.filter((m) => m._id !== msg._id)
                                      );
                                      // Try sending again
                                      setMessage(failedContent);
                                      setTimeout(
                                        () => handleSendMessage(),
                                        100
                                      );
                                    }}
                                    className="text-xs underline hover:text-destructive/80"
                                  >
                                    Retry
                                  </button>
                                </div>
                              )}
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
