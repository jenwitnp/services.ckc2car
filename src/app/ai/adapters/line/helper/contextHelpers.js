import { conversationCache } from "@/app/ai/services/conversations/ConversationCacheService.js";
import { importantKeywords } from "@/app/ai/services/conversations/keywords/ImportantKeywordsService.js";
import { conversationDb } from "@/app/ai/services/conversations/ConversationDatabaseService.js";
import { timeOperation } from "@/app/ai/services/monitoring/PerformanceMonitor.js";

/**
 * ✅ Smart context loading with performance monitoring
 */
export async function loadContextMessages(text, context) {
  return await timeOperation("line-context-loading", async () => {
    let messages = [];
    const needsHistory = importantKeywords.needsHistory(text);

    if (needsHistory) {
      console.log(`[LINE] Loading context from database for complex query`);
      const dbResult = await conversationDb.loadMinimalContext(
        context.userId,
        "line"
      );

      if (dbResult.success) {
        messages = dbResult.messages;
        // Add to cache for future use
        messages.forEach((msg) =>
          conversationCache.addMessage(context.userId, msg)
        );
      } else {
        console.error(`[LINE] Failed to load DB context: ${dbResult.error}`);
        messages = conversationCache.getMessages(context.userId);
      }
    } else {
      // 🚀 Get from memory cache
      messages = conversationCache.getMessages(context.userId);
      console.log(`[LINE] Using ${messages.length} cached messages`);
    }

    // Add current user message
    const userMessage = { role: "user", content: text };
    messages.push(userMessage);

    return messages;
  });
}

/**
 * ✅ Cache conversation messages
 */
export function cacheConversationMessages(
  context,
  userMessage,
  assistantMessage
) {
  conversationCache.addMessage(context.userId, userMessage);
  conversationCache.addMessage(context.userId, assistantMessage);
}

/**
 * ✅ Save important conversations to database
 */
export async function saveImportantConversation(
  text,
  processedResponse,
  context,
  userMessage,
  assistantMessage
) {
  if (importantKeywords.shouldSaveToDatabase(text, processedResponse)) {
    console.log(`[LINE] Saving important conversation to database`);

    return await timeOperation("line-db-save", async () => {
      const saveResult = await conversationDb.saveImportantConversation(
        context.userId,
        userMessage,
        assistantMessage,
        {
          functionCallData: processedResponse.functionCall || null,
          importance: "high",
          platform: "line",
        }
      );

      if (!saveResult.success) {
        console.error(
          `[LINE] Failed to save conversation: ${saveResult.error}`
        );
      }

      return saveResult;
    });
  } else {
    console.log(`[LINE] Skipping DB save - casual conversation`);
    return { success: true, skipped: true };
  }
}
