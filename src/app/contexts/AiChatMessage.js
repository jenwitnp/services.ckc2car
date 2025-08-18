"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// Create context
const AiChatMessageContext = createContext(null);

/**
 * Provider component for managing AI chat messages
 */
export function AiChatMessageProvider({ children }) {
  const [messages, setMessages] = useState([]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // ✅ Enhanced addMessage - preserve ALL properties from your AI system
  const addMessage = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      {
        // ✅ Preserve ALL original message properties
        ...message,
        // ✅ Ensure required fields with fallbacks
        id: message.id || `msg_${Date.now()}`,
        role: message.role,
        text: message.text || message.content || "",
        timestamp: message.timestamp || new Date().toISOString(),
        // ✅ Keep query-related properties for button logic
        isQuery: message.isQuery || false,
        query: message.query || null,
        count: message.count || 0,
        rawData: message.rawData || [],
        // ✅ Keep enhanced properties from new AI architecture
        functionName: message.functionName || null,
        functionCalls: message.functionCalls || [],
        conversationId: message.conversationId || null,
        cached: message.cached || false,
        importance: message.importance || null,
        platform: message.platform || "web",
        // ✅ Keep error handling properties
        isError: message.isError || false,
        error: message.error || null,
      },
    ]);
  }, []);

  // ✅ Add helper method to update a specific message (useful for streaming responses)
  const updateMessage = useCallback((messageId, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  // ✅ Add helper method to get message by ID
  const getMessage = useCallback(
    (messageId) => {
      return messages.find((msg) => msg.id === messageId);
    },
    [messages]
  );

  // ✅ Add helper method to get query messages only
  const getQueryMessages = useCallback(() => {
    return messages.filter((msg) => msg.isQuery && msg.count > 0);
  }, [messages]);

  // Value object with state and methods
  const value = {
    messages,
    setMessages,
    clearMessages,
    addMessage,
    updateMessage,
    getMessage,
    getQueryMessages,
  };

  return (
    <AiChatMessageContext.Provider value={value}>
      {children}
    </AiChatMessageContext.Provider>
  );
}

/**
 * Custom hook for accessing AI chat messages context
 */
export function useAiChatMessage() {
  const context = useContext(AiChatMessageContext);
  if (context === null) {
    throw new Error(
      "useAiChatMessage must be used within an AiChatMessageProvider"
    );
  }
  return context;
}
