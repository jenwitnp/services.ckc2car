import { useState, useRef, useCallback } from "react";
import { messageUtils } from "../utils/messageUtils";

export const useChatMessage = (session, carContext, aiConfig, addMessage) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(
    async (input, messages) => {
      if (!input.trim() || isLoading || carContext.isLoading) return;

      const userMessage = messageUtils.createUserMessage(
        input,
        session?.user?.id
      );
      addMessage(userMessage);

      setIsLoading(true);
      setIsTyping(true);
      abortControllerRef.current = new AbortController();

      try {
        const conversationContext = {
          userId: session?.user?.id,
          platform: "web", // ✅ Add platform detection
          sessionId: `web_${session?.user?.id}_${Date.now()}`,
          smartCaching: aiConfig.smartCaching,
          contextSource: "CarContextService",
        };

        const chatMessages = messages.map(({ role, text }) => ({
          role,
          content: text,
        }));
        chatMessages.push({ role: "user", content: input });

        console.log("[useChatMessage] Sending to AI system:", {
          messageCount: chatMessages.length,
          context: conversationContext,
          config: aiConfig,
          carContextLoaded: !carContext.isLoading,
        });

        const response = await fetch("/api/v1/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages,
            context: conversationContext, // ✅ Now includes platform: "web"
            config: aiConfig,
            user: {
              ...session?.user,
              platform: "web", // ✅ Add platform to user object
            },
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const aiResponse = await response.json();
        setIsTyping(false);

        if (aiResponse.success) {
          const assistantMessage =
            messageUtils.createAssistantMessage(aiResponse);
          addMessage(assistantMessage);

          // Save query results for "View All Results"
          if (aiResponse.isQuery && aiResponse.count > 0) {
            sessionStorage.setItem(
              "lastCarQuery",
              JSON.stringify({
                query: aiResponse.query,
                count: aiResponse.count,
                messageId: assistantMessage.id,
                timestamp: assistantMessage.timestamp,
                rawData: aiResponse.rawData,
              })
            );
          }
        } else {
          const errorMessage = messageUtils.createErrorMessage(
            aiResponse.summary || "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล",
            aiResponse.error
          );
          addMessage(errorMessage);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("[useChatMessage] Error:", error);

          let errorMsg =
            "ขออภัยค่ะ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";

          if (error.message?.includes("429")) {
            errorMsg =
              "คุณส่งข้อความเร็วเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้งค่ะ";
          } else if (error.message?.includes("network")) {
            errorMsg =
              "เกิดปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่อีกครั้งค่ะ";
          }

          const errorMessage = messageUtils.createErrorMessage(errorMsg, error);
          addMessage(errorMessage);
        }
      } finally {
        setIsLoading(false);
        setIsTyping(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, session?.user, carContext, aiConfig, addMessage]
  );

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setIsTyping(false);
    }
  }, []);

  return {
    isLoading,
    isTyping,
    sendMessage,
    cancelRequest,
  };
};
