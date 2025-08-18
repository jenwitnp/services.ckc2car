"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Import your existing services
import { useAiChatMessage } from "@/app/contexts/AiChatMessage";

// Import new modular components and hooks
import { useCarContext } from "./hooks/useCarContext";
import { useResponsiveDesign } from "./hooks/useResponsiveDesign";
import { useChatMessage } from "./hooks/useChatMessage";
import ChatHeader from "./components/ChatHeader";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import { CONSTANTS } from "./utils/constants";

const GeminiCarChatbot = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { messages, clearMessages, addMessage } = useAiChatMessage();
  const { isDesktop, isMobile } = useResponsiveDesign();
  const { carContext, loadCarContext } = useCarContext(session?.user?.id);

  // UI State
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState(CONSTANTS.DEFAULTS.AI_CONFIG);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Chat message handling
  const { isLoading, isTyping, sendMessage, cancelRequest } = useChatMessage(
    session,
    carContext,
    aiConfig,
    addMessage
  );

  // Load car context on mount
  useEffect(() => {
    loadCarContext();
  }, [loadCarContext]);

  // Auto-scroll and focus effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isDesktop && inputRef.current && !isLoading && !carContext.isLoading) {
      inputRef.current.focus();
    }
  }, [isDesktop, isLoading, carContext.isLoading]);

  // Enhanced clear chat
  const clearChat = useCallback(() => {
    if (window.confirm("ต้องการล้างประวัติการสนทนาทั้งหมดหรือไม่?")) {
      clearMessages();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [clearMessages]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    await sendMessage(input.trim(), messages);
    setInput("");
  }, [input, sendMessage, messages]);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  return (
    <div
      className={`flex flex-col h-full ${
        isDesktop ? "min-h-screen" : "h-screen"
      }`}
    >
      {/* Header */}
      <ChatHeader
        isDesktop={isDesktop}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        clearChat={clearChat}
        carContext={carContext}
        loadCarContext={loadCarContext}
        aiConfig={aiConfig}
        setAiConfig={setAiConfig}
      />

      {/* Messages Container */}
      <ChatMessages
        messages={messages}
        isDesktop={isDesktop}
        isMobile={isMobile}
        carContext={carContext}
        setInput={setInput}
        isLoading={isLoading}
        isTyping={isTyping}
        cancelRequest={cancelRequest}
        messagesEndRef={messagesEndRef}
      />

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleKeyPress={handleKeyPress}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
        carContext={carContext}
        isDesktop={isDesktop}
        inputRef={inputRef}
        messages={messages}
        session={session}
        aiConfig={aiConfig}
      />
    </div>
  );
};

export default GeminiCarChatbot;
