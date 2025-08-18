"use client";

import React, { useEffect } from "react";
import { Send, Brain, Car } from "lucide-react";
import { CONSTANTS } from "../utils/constants";

const StatusBar = ({ messages, session, aiConfig, carContext }) => {
  return (
    <div className="flex justify-between items-center mt-2 text-xs text-main-200">
      <div className="flex items-center space-x-4">
        <span>Messages: {messages.length}</span>
        {session?.user && <span>User: {session.user.name}</span>}

        <span
          className={`flex items-center ${
            aiConfig.smartCaching ? "text-success-400" : "text-main-400"
          }`}
        >
          <Brain size={12} className="mr-1" />
          Smart Cache: {aiConfig.smartCaching ? "ON" : "OFF"}
        </span>

        <span
          className={`flex items-center ${
            carContext.error
              ? "text-danger-400"
              : carContext.isLoading
              ? "text-warning-400"
              : "text-success-400"
          }`}
        >
          <Car size={12} className="mr-1" />
          Car Context:{" "}
          {carContext.error
            ? "ERROR"
            : carContext.isLoading
            ? "LOADING"
            : "READY"}
        </span>
      </div>

      <div className="hidden md:block">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

const ChatInput = ({
  input,
  setInput,
  handleKeyPress,
  handleSendMessage,
  isLoading,
  carContext,
  isDesktop,
  inputRef,
  messages,
  session,
  aiConfig,
}) => {
  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "48px";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 120) + "px";
    }
  }, [input, inputRef]);

  const isDisabled = isLoading || !input.trim() || carContext.isLoading;

  return (
    <div
      className={`${
        CONSTANTS.CSS_CLASSES.CHAT_SURFACE
      } border-t border-main-700 p-4 shadow-lg ${
        isDesktop
          ? "max-w-4xl mx-auto w-full rounded-b-lg"
          : "fixed bottom-0 left-0 right-0"
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Text Input */}
        <div className="flex-1">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="สอบถามข้อมูลรถยนต์ได้เลยนะคะ..."
            disabled={isLoading || carContext.isLoading}
            className={`w-full px-4 py-3 border border-main-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-success-500 focus:border-transparent resize-none bg-main-700 text-main-100 placeholder-main-400 shadow-sm transition-all duration-200`}
            rows={1}
            style={{
              minHeight: "48px",
              maxHeight: "120px",
              overflowY: input.split("\n").length > 3 ? "scroll" : "hidden",
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendMessage}
          disabled={isDisabled}
          className={`p-3 rounded-2xl transition-all duration-200 ${
            isDisabled
              ? "bg-main-700 cursor-not-allowed"
              : `${CONSTANTS.CSS_CLASSES.BG_PRIMARY} ${CONSTANTS.CSS_CLASSES.BG_PRIMARY_HOVER} shadow-lg hover:shadow-xl transform hover:scale-105`
          }`}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-main-200 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={20} className="text-white" />
          )}
        </button>
      </div>

      {/* Status Bar */}
      <StatusBar
        messages={messages}
        session={session}
        aiConfig={aiConfig}
        carContext={carContext}
      />
    </div>
  );
};

export default ChatInput;
