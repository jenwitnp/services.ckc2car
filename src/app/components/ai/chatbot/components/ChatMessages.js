"use client";

import React from "react";
import { Car, RotateCcw } from "lucide-react";
import MessageRenderer from "./MessageRenderer";
import { CONSTANTS } from "../utils/constants";

const WelcomeMessage = ({ carContext, setInput }) => {
  const suggestions = [
    { text: "มีรถอัลติสไหม", icon: "🚗" },
    { text: "รถราคาไม่เกิน 500,000", icon: "💰" },
    { text: "รถ SUV", icon: "🚙" },
    { text: "จองการนัดหมาย", icon: "📅" },
  ];

  return (
    <div className="text-center py-8">
      <div
        className={`w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
      >
        <Car size={32} className="text-white" />
      </div>
      <h2 className="text-xl font-bold text-main-100 mb-2">
        สวัสดีค่ะ! ยินดีต้อนรับสู่ CKC2Car
      </h2>
      <p className="text-main-300 max-w-md mx-auto leading-relaxed mb-4">
        ระบบ AI ที่ได้รับการปรับปรุงใหม่ พร้อมการจัดการบทสนทนาอัจฉริยะ
        และการเชื่อมต่อกับระบบรถยนต์แบบเต็มรูปแบบ
      </p>

      {!carContext.isLoading && !carContext.error && (
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.text}
              onClick={() => setInput(suggestion.text)}
              className={`px-4 py-2 bg-white border border-success-500 text-success-600 rounded-full text-sm hover:bg-success-500 hover:text-white transition-colors shadow-sm flex items-center space-x-2`}
            >
              <span>{suggestion.icon}</span>
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TypingIndicator = ({ isLoading, isTyping, cancelRequest }) => {
  if (!isLoading && !isTyping) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-white border border-main-200 rounded-r-2xl rounded-tl-2xl shadow-sm px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[0, 0.1, 0.2].map((delay, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-success-500 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
          <span className="text-sm text-main-500">AI กำลังคิด...</span>
          {isLoading && (
            <button
              onClick={cancelRequest}
              className="ml-2 text-danger-500 hover:text-danger-600 transition-colors"
              title="Cancel Request"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatMessages = ({
  messages,
  isDesktop,
  isMobile,
  carContext,
  setInput,
  isLoading,
  isTyping,
  cancelRequest,
  messagesEndRef,
}) => {
  return (
    <div
      className={`flex-1 ${
        CONSTANTS.CSS_CLASSES.CHAT_BACKGROUND
      } overflow-hidden ${isDesktop ? "max-w-4xl mx-auto w-full" : ""}`}
    >
      <div
        className={`h-full overflow-y-auto px-4 py-4 space-y-4 ${
          isMobile ? "pb-20" : "pb-4"
        }`}
      >
        {/* Welcome Message */}
        {messages.length === 0 && (
          <WelcomeMessage carContext={carContext} setInput={setInput} />
        )}

        {/* Messages */}
        {messages.map((message) => (
          <MessageRenderer
            key={message.id}
            message={message}
            isDesktop={isDesktop}
          />
        ))}

        {/* Typing Indicator */}
        <TypingIndicator
          isLoading={isLoading}
          isTyping={isTyping}
          cancelRequest={cancelRequest}
        />

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
