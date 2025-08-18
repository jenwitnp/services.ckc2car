import { NextResponse } from "next/server";
import { processWebRequest } from "@/app/ai/adapters/web.js";
import { conversationCache } from "@/app/ai/services/conversations/ConversationCacheService.js";
import { importantKeywords } from "@/app/ai/services/conversations/keywords/ImportantKeywordsService.js";
import { conversationDb } from "@/app/ai/services/conversations/ConversationDatabaseService.js";
import { carContextService } from "@/app/ai/services/context/CarContextService.js";

export async function POST(request) {
  try {
    const { messages, context, config, user } = await request.json();

    console.log("[Enhanced AI Chat API] Processing request:", {
      messageCount: messages.length,
      userId: user?.id,
      platform: context?.platform,
      config,
      contextSource: context?.contextSource,
    });

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];
    const userText = latestMessage?.content || "";

    // 🧠 STEP 1: Analyze message importance and history needs
    const messageAnalysis = importantKeywords.analyzeMessage(userText);
    console.log("[Enhanced AI Chat API] Message analysis:", messageAnalysis);

    // 🚗 STEP 2: Ensure car context is available (fallback if not provided)
    let carContext = {
      carModels: context?.carModels || [],
      branches: context?.branches || [],
      carTypes: context?.carTypes || [],
    };

    // If no car context provided or empty, load from CarContextService
    if (!carContext.carModels.length && !carContext.branches.length) {
      console.log(
        "[Enhanced AI Chat API] Loading car context from CarContextService"
      );
      try {
        const contextData = await carContextService.getUserContext(
          user?.id || "anonymous",
          context?.platform || "web"
        );

        if (!contextData.fallback) {
          carContext = {
            carModels: contextData.carModels || [],
            branches: contextData.branches || [],
            carTypes: contextData.carTypes || [],
          };
          console.log("[Enhanced AI Chat API] Car context loaded:", {
            carModels: carContext.carModels.length,
            branches: carContext.branches.length,
            carTypes: carContext.carTypes.length,
          });
        }
      } catch (contextError) {
        console.error(
          "[Enhanced AI Chat API] Car context loading error:",
          contextError
        );
      }
    }

    // 🗄️ STEP 3: Determine message source (cache vs database)
    let conversationMessages = [];
    let sourceInfo = { source: "none", count: 0 };

    if (config.enableHistory && context.userId) {
      if (messageAnalysis.needsHistory) {
        console.log(
          `[Enhanced AI Chat API] Loading database context for platform: ${
            context.platform || "web"
          }`
        );

        // ✅ Pass platform info to database service
        const dbResult = await conversationDb.loadMinimalContext(
          context.userId,
          context.platform || "web" // ✅ Add platform parameter
        );

        if (dbResult.success && !dbResult.skipped) {
          conversationMessages = dbResult.messages || [];
          sourceInfo = {
            source: "database",
            count: conversationMessages.length,
            platform: context.platform || "web",
          };
          console.log(
            `[Enhanced AI Chat API] Loaded ${conversationMessages.length} messages from database`
          );
        } else if (dbResult.skipped) {
          console.log(
            `[Enhanced AI Chat API] Database skipped for platform: ${
              context.platform || "web"
            }`
          );
        }
      }

      if (conversationMessages.length === 0) {
        // Fallback to cache
        conversationMessages = conversationCache.getMessages(context.userId);
        sourceInfo = { source: "cache", count: conversationMessages.length };
      }
    }

    // 🤖 STEP 4: Process with AI system
    const enhancedContext = {
      ...context,
      // Override with current car context
      carModels: carContext.carModels,
      branches: carContext.branches,
      carTypes: carContext.carTypes,
      messageAnalysis,
      sourceInfo,
      contextSource: "CarContextService",
    };

    const aiResponse = await processWebRequest(
      [...conversationMessages, ...messages],
      enhancedContext,
      user
    );

    // 📊 STEP 5: Update conversation cache
    if (context.userId && config.smartCaching) {
      // Add user message to cache
      conversationCache.addMessage(context.userId, {
        role: "user",
        content: userText,
        timestamp: new Date().toISOString(),
      });

      // Add assistant response to cache
      conversationCache.addMessage(context.userId, {
        role: "assistant",
        content: aiResponse.summary || "",
        timestamp: new Date().toISOString(),
        metadata: {
          functionCalls: aiResponse.functionCalls,
          isQuery: aiResponse.isQuery,
          count: aiResponse.count,
        },
      });
    }

    // 💾 STEP 6: Save important conversations to database
    if (messageAnalysis.shouldSave || aiResponse.functionCalls?.length > 0) {
      try {
        console.log(
          `[Enhanced AI Chat API] Saving conversation for platform: ${
            context.platform || "web"
          }`
        );

        await conversationDb.saveImportantConversation(
          context.userId,
          {
            role: "user",
            content: userText,
            timestamp: new Date().toISOString(),
          },
          {
            role: "assistant",
            content: aiResponse.summary || "",
            timestamp: new Date().toISOString(),
            metadata: {
              functionCalls: aiResponse.functionCalls,
              isQuery: aiResponse.isQuery,
              count: aiResponse.count,
            },
          },
          {
            importance: messageAnalysis.priority,
            categories: messageAnalysis.categories,
            functionCallData: aiResponse.functionCalls,
            platform: context.platform || "web", // ✅ Add platform info
            carContextUsed: {
              carModels: carContext.carModels.length,
              branches: carContext.branches.length,
              carTypes: carContext.carTypes.length,
            },
          }
        );
      } catch (error) {
        console.error(
          "[Enhanced AI Chat API] Error saving conversation:",
          error
        );
      }
    }

    // 📈 STEP 7: Get updated conversation statistics
    const statsResult = await conversationDb.getConversationStats(
      context.userId
    );

    // 🎯 STEP 8: Enhanced response with metadata
    const enhancedResponse = {
      ...aiResponse,
      conversationId: `conv_${context.userId}_${Date.now()}`,
      cached: sourceInfo.source === "cache",
      messageAnalysis,
      sourceInfo,
      carContextUsed: carContext,
      stats: statsResult.success ? statsResult.stats : null,
      config: {
        historyEnabled: config.enableHistory,
        cachingEnabled: config.smartCaching,
        temperature: config.temperature,
        carContextSource: "CarContextService",
      },
    };

    console.log("[Enhanced AI Chat API] Response prepared:", {
      success: enhancedResponse.success,
      hasFunction: !!enhancedResponse.functionCalls?.length,
      cached: enhancedResponse.cached,
      importance: messageAnalysis.priority,
      carContextUsed: {
        carModels: carContext.carModels.length,
        branches: carContext.branches.length,
        carTypes: carContext.carTypes.length,
      },
    });

    return NextResponse.json(enhancedResponse);
  } catch (error) {
    console.error("[Enhanced AI Chat API] Error:", error);

    return NextResponse.json(
      {
        success: false,
        summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในระบบ AI กรุณาลองใหม่อีกครั้งค่ะ",
        error: error.message,
        conversationId: null,
        cached: false,
        carContextUsed: null,
      },
      { status: 500 }
    );
  }
}

// ✅ END OF FILE - NO MORE CODE AFTER THIS
