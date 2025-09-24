import { processAIRequest } from "@/app/ai/core";
import { conversationDb } from "@/app/ai/services/conversations/ConversationDatabaseService.js";
// 🚀 Import performance optimizations
import { aiResponseCache } from "@/app/ai/services/cache/AIResponseCache.js";
import {
  performanceMonitor,
  timeOperation,
} from "@/app/ai/services/monitoring/PerformanceMonitor.js";

// ✅ Import helpers from the line folder
import {
  handleAIResponse,
  loadContextMessages,
  cacheConversationMessages,
  saveImportantConversation,
} from "./line/helper/index.js";

export async function processLineRequest(text, context = {}) {
  const startTime = Date.now();

  try {
    // 🚀 STEP 1: Check AI response cache first
    const cacheKey = aiResponseCache.generateKey(text, context);
    const cachedResponse = aiResponseCache.get(cacheKey);

    if (cachedResponse) {
      const duration = Date.now() - startTime;
      performanceMonitor.recordRequest(duration, true);
      performanceMonitor.recordCache(true); // Cache hit

      console.log(`[LINE] Cache HIT! Response time: ${duration}ms`);
      return cachedResponse;
    }

    // Cache miss - proceed with normal processing
    performanceMonitor.recordCache(false);

    // 🧹 Random background cleanup
    if (conversationDb.shouldTriggerCleanup()) {
      conversationDb
        .cleanupOldConversations()
        .catch((err) =>
          console.error("[LINE] Background cleanup failed:", err)
        );
    }

    // 🎯 STEP 2: Smart context loading with performance monitoring
    const [messages, contextData] = await Promise.all([
      loadContextMessages(text, context), // ✅ Use helper function
      Promise.resolve(context), // Load context in parallel (if needed)
    ]);

    console.log(`[LINE Adapter] Processing with ${messages.length} messages`);

    // 🤖 STEP 3: Process AI request with timeout protection
    const aiResponse = await Promise.race([
      timeOperation("line-ai-processing", async () => {
        return await processAIRequest(messages, contextData, "line", {
          temperature: 0.6,
          maxTokens: 500,
        });
      }),

      // Timeout protection
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI_TIMEOUT")), 8000)
      ),
    ]);

    // ✅ Handle function calls using helper
    const processedResponse = await timeOperation(
      "line-function-handling",
      async () => {
        return await handleAIResponse(aiResponse, contextData, text);
      }
    );

    // 🎯 STEP 4: Cache successful responses
    if (aiResponseCache.shouldCache(processedResponse, text)) {
      aiResponseCache.set(cacheKey, processedResponse);
    }

    // 🎯 STEP 5: Cache management using helpers
    const userMessage = { role: "user", content: text };
    const assistantMessage = {
      role: "assistant",
      content:
        processedResponse.type === "text"
          ? processedResponse.text
          : "[Rich Message]",
    };

    cacheConversationMessages(context, userMessage, assistantMessage);

    // 🎯 STEP 6: Selective database saving using helper
    await saveImportantConversation(
      text,
      processedResponse,
      context,
      userMessage,
      assistantMessage
    );

    // Record successful request
    const totalDuration = Date.now() - startTime;
    performanceMonitor.recordRequest(totalDuration, true);

    console.log(`[LINE] Total processing time: ${totalDuration}ms`);
    return processedResponse;
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    if (error.message === "AI_TIMEOUT") {
      console.warn(`[LINE] AI timeout after ${totalDuration}ms`);
      performanceMonitor.recordAI(totalDuration, false, true); // timeout = true
      performanceMonitor.recordRequest(totalDuration, false);

      return {
        type: "text",
        text: "ขออภัยค่ะ ระบบใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้งค่ะ",
      };
    }

    console.error("[LINE Adapter] Error:", error);
    performanceMonitor.recordRequest(totalDuration, false);

    return {
      type: "text",
      text: "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งค่ะ",
    };
  }
}

// 🎯 EXPORT SERVICE MANAGEMENT FUNCTIONS (keep existing exports)
export function getCacheStats() {
  const {
    conversationCache,
  } = require("@/app/ai/services/conversations/ConversationCacheService.js");
  return conversationCache.getStats();
}

export function getDbStats(userId = null) {
  return conversationDb.getConversationStats(userId);
}

export function clearUserCache(userId) {
  const {
    conversationCache,
  } = require("@/app/ai/services/conversations/ConversationCacheService.js");
  return conversationCache.clearUser(userId);
}

export function clearUserDb(userId) {
  return conversationDb.deleteUserConversations(userId);
}

export function searchConversations(searchTerm, options = {}) {
  return conversationDb.searchConversations(searchTerm, options);
}

// 🚀 Performance monitoring exports
export function getAICacheStats() {
  return aiResponseCache.getStats();
}

export function getPerformanceStats() {
  return performanceMonitor.getStats();
}

export function getPerformanceReport() {
  return performanceMonitor.generateReport();
}

export function clearAICache() {
  return aiResponseCache.clear();
}

export function clearUserAICache(userId) {
  return aiResponseCache.clearUser(userId);
}

export function getSystemStatus() {
  const {
    conversationCache,
  } = require("@/app/ai/services/conversations/ConversationCacheService.js");
  const {
    importantKeywords,
  } = require("@/app/ai/services/conversations/keywords/ImportantKeywordsService.js");

  return {
    cache: conversationCache.getStats(),
    database: conversationDb.getServiceStatus(),
    keywords: importantKeywords.getAllKeywords(),
    aiCache: aiResponseCache.getStats(), // 🚀 NEW
    performance: performanceMonitor.getStats(), // 🚀 NEW
  };
}
