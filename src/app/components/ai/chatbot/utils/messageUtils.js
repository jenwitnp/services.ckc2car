export const messageUtils = {
  getMessageType: (message) => {
    if (message.isError) return "error";
    if (message.functionCalls?.length > 0) return "function";
    if (message.isQuery) return "query";
    if (message.role === "user") return "user";
    return "assistant";
  },

  shouldShowViewAllButton: (message) => {
    return (
      message.role === "model" &&
      message.isQuery === true &&
      message.count > 0 &&
      message.query
    );
  },

  extractUrlsFromText: (text) => {
    const pattern = /\/car\/show-[a-zA-Z0-9\-]+-sku-(\d+)/g;
    return [...text.matchAll(pattern)];
  },

  createUserMessage: (text, userId) => ({
    id: `msg_${Date.now()}`,
    role: "user",
    text: text.trim(),
    timestamp: new Date().toISOString(),
    platform: "web",
  }),

  createAssistantMessage: (aiResponse) => ({
    id: `msg_${Date.now()}`,
    role: "model",
    text: aiResponse.summary || "ขออภัยค่ะ ไม่สามารถประมวลผลได้",
    timestamp: new Date().toISOString(),
    platform: "web",
    isQuery: aiResponse.isQuery || false,
    query: aiResponse.query || null,
    count: aiResponse.count || 0,
    rawData: aiResponse.rawData || [],
    functionName: aiResponse.functionName || null,
    functionCalls: aiResponse.functionCalls || [],
    conversationId: aiResponse.conversationId,
    cached: aiResponse.cached,
    importance: aiResponse.importance,
  }),

  createErrorMessage: (errorText, error = null) => ({
    id: `msg_${Date.now()}`,
    role: "model",
    text: errorText,
    timestamp: new Date().toISOString(),
    platform: "web",
    isError: true,
    error: error?.message || error,
  }),
};
