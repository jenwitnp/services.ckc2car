export { default } from "./GeminiCarChatbot";
export { default as GeminiCarChatbot } from "./GeminiCarChatbot";

// Export individual components for external use if needed
export { default as CarDetailButton } from "./components/CarDetailButton";
export { default as MessageRenderer } from "./components/MessageRenderer";
export { default as ChatHeader } from "./components/ChatHeader";
export { default as ChatMessages } from "./components/ChatMessages";
export { default as ChatInput } from "./components/ChatInput";

// Export hooks for external use if needed
export { useCarContext } from "./hooks/useCarContext";
export { useResponsiveDesign } from "./hooks/useResponsiveDesign";
export { useChatMessage } from "./hooks/useChatMessage";

// Export utilities
export { messageUtils } from "./utils/messageUtils";
export { urlUtils } from "./utils/urlUtils";
export { CONSTANTS } from "./utils/constants";
