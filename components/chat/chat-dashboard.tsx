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
import { LoadingMessages } from "./LoadingMessages";

export const ChatDashboard = ({
  initialConversationId,
  initialMessages = [],
}: {
  initialConversationId?: string;
  initialMessages?: Message[];
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
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

  // Handle sending a message
  const handleSendMessage = async () => {
    if (message.trim() && currentConversationId) {
      setIsSending(true);

      // Create optimistic message
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        senderId: {
          _id: "currentUser",
          name: "You",
          image: undefined,
        },
        type: "text",
        content: [message.trim()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "sending",
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setMessage("");

      try {
        const { success, error } = await sendMessage(
          currentConversationId,
          optimisticMessage.content[0]
        );

        if (success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === optimisticMessage._id
                ? { ...msg, status: "sent" }
                : msg
            )
          );

          const { messages: serverMessages } = await fetchConversationMessages(
            currentConversationId
          );

          if (serverMessages) {
            // Preserve status information when updating from server
            const typedMessages = serverMessages.map((msg) => {
              // Find if we have this message in our current state
              const existingMsg = messages.find(
                (m) =>
                  // Match by ID or by content/time if it's our optimistic message
                  m._id === msg._id ||
                  (m.content[0] === msg.content[0] &&
                    Math.abs(
                      new Date(m.createdAt).getTime() -
                        new Date(msg.createdAt).getTime()
                    ) < 10000)
              );

              return {
                ...msg,
                type: msg.type || "text",
                // Keep the status if it exists
                status: existingMsg?.status || msg.status,
              };
            }) as Message[];
            setMessages(typedMessages);
          }
        }
      } catch (err) {
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

  // Handle click outside search dropdown
  const handleClickOutside = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest("[data-search-result]")) {
      setIsSearchDropdownOpen(false);
    }
  };

  // Effects

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true);
      const { conversations, error } = await fetchUserConversations();

      if (conversations) {
        setConversations(conversations);
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

  // Search users
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
              <ChatHeader
                conversation={conversations[0]}
                isMainHeader={false}
              />
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
                    <LoadingMessages />
                  ) : messages.length === 0 ? (
                    <EmptyState type="noMessages" />
                  ) : (
                    <div className="space-y-4 mb-4 pb-2">
                      {messages.map((msg) => (
                        <MessageItem
                          key={msg._id}
                          message={msg}
                          isCurrentUser={isCurrentUserMessage(msg)}
                          formatTime={formatMessageTime}
                        />
                      ))}
                      <div ref={messagesEndRef} className="h-1" />
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
