import { processAIRequest, summarizeData } from "../core";
import { handleFunctionCalls } from "@/app/ai/tools";
import { apiFactory } from "@/app/services/api/ApiFactory";
import { conversationCache } from "@/app/ai/services/conversations/ConversationCacheService.js";
import { importantKeywords } from "@/app/ai/services/conversations/keywords/ImportantKeywordsService.js";
import { conversationDb } from "@/app/ai/services/conversations/ConversationDatabaseService.js";

export async function processLineRequest(text, context = {}) {
  try {
    // 🧹 Random background cleanup
    if (conversationDb.shouldTriggerCleanup()) {
      conversationDb
        .cleanupOldConversations()
        .catch((err) =>
          console.error("[LINE] Background cleanup failed:", err)
        );
    }

    // 🎯 STEP 1: Smart context loading
    let messages = [];
    const needsHistory = importantKeywords.needsHistory(text);

    if (needsHistory) {
      console.log(`[LINE] Loading context from database for complex query`);
      const dbResult = await conversationDb.loadMinimalContext(
        context.userId,
        "web"
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
      // 🚀 STEP 2: Get from memory cache
      messages = conversationCache.getMessages(context.userId);
      console.log(`[LINE] Using ${messages.length} cached messages`);
    }

    // Add current user message
    const userMessage = { role: "user", content: text };
    messages.push(userMessage);

    console.log(`[LINE Adapter] Processing with ${messages.length} messages`);

    // 🤖 STEP 3: Process AI request
    const aiResponse = await processAIRequest(messages, context, "line", {
      temperature: 0.6,
      maxTokens: 500,
    });

    // Handle function calls (your existing logic)
    const processedResponse = await handleAIResponse(aiResponse, context, text);

    // 🎯 STEP 4: Cache management
    conversationCache.addMessage(context.userId, userMessage);

    const assistantMessage = {
      role: "assistant",
      content:
        processedResponse.type === "text"
          ? processedResponse.text
          : "[Rich Message]",
    };

    conversationCache.addMessage(context.userId, assistantMessage);

    // 🎯 STEP 5: Selective database saving
    if (importantKeywords.shouldSaveToDatabase(text, processedResponse)) {
      console.log(`[LINE] Saving important conversation to database`);

      const saveResult = await conversationDb.saveImportantConversation(
        context.userId,
        userMessage,
        assistantMessage,
        {
          functionCallData: processedResponse.functionCall || null,
          importance: "high",
        }
      );

      if (!saveResult.success) {
        console.error(
          `[LINE] Failed to save conversation: ${saveResult.error}`
        );
      }
    } else {
      console.log(`[LINE] Skipping DB save - casual conversation`);
    }

    return processedResponse;
  } catch (error) {
    console.error("[LINE Adapter] Error:", error);
    return {
      type: "text",
      text: "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งค่ะ",
    };
  }
}

// 🔧 HELPER: Handle AI response and function calls
async function handleAIResponse(initialResponse, context, text) {
  let aiResponse;
  let functionCallData = null;

  if (initialResponse.type === "function_call") {
    console.log("[LINE Adapter] Function call:", initialResponse.functionName);

    functionCallData = {
      function_name: initialResponse.functionName,
      arguments: initialResponse.args,
    };

    if (isAppointmentFunction(initialResponse.functionName)) {
      aiResponse = await handleAppointmentFunction(
        initialResponse,
        context,
        text
      );
    } else {
      aiResponse = await handleGeneralFunction(initialResponse, text);
    }
  } else {
    aiResponse = { type: "text", text: initialResponse.content };
  }

  // Add function call data to response for database saving
  if (functionCallData) {
    aiResponse.functionCall = functionCallData;
  }

  return aiResponse;
}

// 🔧 HELPER: Handle appointment functions
async function handleAppointmentFunction(initialResponse, context, text) {
  const userCheck = await apiFactory.users.checkLineExist(
    context.userId,
    "line"
  );

  if (!userCheck.exists) {
    return createAccountLinkingPrompt(context.userId);
  }

  const enhancedArgs = {
    ...initialResponse.args,
    employee_id: userCheck.user.id,
    _lineUserId: context.userId,
  };

  const functionResult = await handleFunctionCalls(
    initialResponse.functionName,
    enhancedArgs,
    userCheck.user
  );
  console.log("[Line adapters] functionResult : ", functionResult);
  if (functionResult.success && !functionResult.summary) {
    const summary = await summarizeData(
      functionResult.rawData,
      text,
      "appointments"
    );
    return { type: "text", text: summary };
  } else {
    const responseText = functionResult.summary || "ไม่พบข้อมูลนัดหมายค่ะ";
    return { type: "text", text: responseText };
  }
}

// 🔧 HELPER: Handle general functions (cars, etc.)
async function handleGeneralFunction(initialResponse, text) {
  const functionResult = await handleFunctionCalls(
    initialResponse.functionName,
    initialResponse.args,
    null
  );

  if (initialResponse.functionName === "queryCarsComprehensive") {
    if (functionResult.success && functionResult.count > 0) {
      const summary = await summarizeData(functionResult.rawData, text, "cars");
      return createCarResponse(summary, functionResult);
    } else {
      return {
        type: "text",
        text: "ขออภัยค่ะ ไม่พบรถที่ตรงกับความต้องการของคุณ",
      };
    }
  } else {
    return {
      type: "text",
      text: functionResult.summary || "ขออภัยค่ะ ไม่สามารถประมวลผลได้",
    };
  }
}

// 🎯 EXPORT SERVICE MANAGEMENT FUNCTIONS
export function getCacheStats() {
  return conversationCache.getStats();
}

export function getDbStats(userId = null) {
  return conversationDb.getConversationStats(userId);
}

export function clearUserCache(userId) {
  return conversationCache.clearUser(userId);
}

export function clearUserDb(userId) {
  return conversationDb.deleteUserConversations(userId);
}

export function searchConversations(searchTerm, options = {}) {
  return conversationDb.searchConversations(searchTerm, options);
}

export function getSystemStatus() {
  return {
    cache: conversationCache.getStats(),
    database: conversationDb.getServiceStatus(),
    keywords: importantKeywords.getAllKeywords(),
  };
}

// Keep your existing helper functions (createCarResponse, isAppointmentFunction, etc.)
function createCarResponse(summary, functionResult) {
  const cars = functionResult.rawData?.slice(0, 10) || [];
  if (cars.length > 0) {
    return createSimpleCarTextResponse(summary, cars, functionResult.count);
  }
  return { type: "text", text: summary };
}

function createSimpleCarTextResponse(summary, cars, totalCount) {
  let message = `🚗 พบรถ ${totalCount} คัน\n\n`;
  const shortSummary =
    summary.length > 200 ? summary.substring(0, 197) + "..." : summary;
  message += `${shortSummary}\n\n`;

  const topCars = cars.slice(0, 3);
  topCars.forEach((car, index) => {
    message += `${index + 1}. ${car.ยี่ห้อ} ${car.รุ่น} ${car.รถปี}\n`;
    message += `   ราคา: ${Number(car.ราคา).toLocaleString("th-TH")} บาท\n`;
    message += `   ผ่อน: ${Number(car.ผ่อน).toLocaleString("th-TH")} บาท\n`;
    message += `   สาขา: ${car.สาขา}\n`;
    if (car.url) {
      const absoluteUrl = car.url.startsWith("http")
        ? car.url
        : `https://ckc2car.com${car.url}`;
      message += `   รายละเอียด: ${absoluteUrl}\n`;
    }
    message += `\n`;
  });

  if (totalCount > 3) {
    message += `ดูรถทั้งหมด: https://ckc2car.com/cars`;
  }

  return { type: "text", text: message };
}

function isAppointmentFunction(functionName) {
  const appointmentFunctions = [
    "bookAppointment",
    "editAppointment",
    "cancelAppointment",
    "queryAppointments",
  ];
  return appointmentFunctions.includes(functionName);
}

function createAccountLinkingPrompt(lineUserId) {
  return {
    type: "flex",
    altText: "กรุณาเชื่อมต่อบัญชีก่อนทำการนัดหมาย",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🔐 จำเป็นต้องเชื่อมต่อบัญชี",
            weight: "bold",
            size: "lg",
            color: "#FF6B6B",
          },
          {
            type: "text",
            text: "เพื่อทำการนัดหมาย คุณจำเป็นต้องเชื่อมต่อบัญชี LINE กับระบบ CRM ของเราก่อนค่ะ",
            wrap: true,
            margin: "md",
            color: "#666666",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#4ECDC4",
            action: {
              type: "uri",
              label: "เชื่อมต่อบัญชี",
              uri: `https://your-domain.com/login?lineUserId=${lineUserId}&source=line`,
            },
          },
        ],
      },
    },
  };
}
