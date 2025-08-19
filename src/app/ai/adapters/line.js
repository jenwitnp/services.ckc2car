import { processAIRequest, summarizeData } from "../core";
import { handleFunctionCalls } from "@/app/ai/tools";
import { apiFactory } from "@/app/services/api/ApiFactory";
import { conversationCache } from "@/app/ai/services/conversations/ConversationCacheService.js";
import { importantKeywords } from "@/app/ai/services/conversations/keywords/ImportantKeywordsService.js";
import { conversationDb } from "@/app/ai/services/conversations/ConversationDatabaseService.js";
// ✅ Import the URL utilities to generate proper car URLs
import { getCarDetailUrl } from "@/app/utils/urlUtils.server";
// 🚀 Import performance optimizations
import { aiResponseCache } from "@/app/ai/services/cache/AIResponseCache.js";
import {
  performanceMonitor,
  timeOperation,
} from "@/app/ai/services/monitoring/PerformanceMonitor.js";

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
      timeOperation("line-context-loading", async () => {
        let messages = [];
        const needsHistory = importantKeywords.needsHistory(text);

        if (needsHistory) {
          console.log(`[LINE] Loading context from database for complex query`);
          const dbResult = await conversationDb.loadMinimalContext(
            context.userId,
            "line" // ✅ Fixed: use "line" instead of "web"
          );

          if (dbResult.success) {
            messages = dbResult.messages;
            // Add to cache for future use
            messages.forEach((msg) =>
              conversationCache.addMessage(context.userId, msg)
            );
          } else {
            console.error(
              `[LINE] Failed to load DB context: ${dbResult.error}`
            );
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
      }),

      // Load context in parallel (if needed)
      Promise.resolve(context),
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

    // Handle function calls (your existing logic)
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

    // 🎯 STEP 5: Cache management
    const userMessage = { role: "user", content: text };
    conversationCache.addMessage(context.userId, userMessage);

    const assistantMessage = {
      role: "assistant",
      content:
        processedResponse.type === "text"
          ? processedResponse.text
          : "[Rich Message]",
    };

    conversationCache.addMessage(context.userId, assistantMessage);

    // 🎯 STEP 6: Selective database saving
    if (importantKeywords.shouldSaveToDatabase(text, processedResponse)) {
      console.log(`[LINE] Saving important conversation to database`);

      await timeOperation("line-db-save", async () => {
        const saveResult = await conversationDb.saveImportantConversation(
          context.userId,
          userMessage,
          assistantMessage,
          {
            functionCallData: processedResponse.functionCall || null,
            importance: "high",
            platform: "line", // ✅ Fixed: use "line" platform
          }
        );

        if (!saveResult.success) {
          console.error(
            `[LINE] Failed to save conversation: ${saveResult.error}`
          );
        }
      });
    } else {
      console.log(`[LINE] Skipping DB save - casual conversation`);
    }

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

    // ✅ FIXED: Direct function name checking instead of isAppointmentFunction
    const appointmentFunctions = [
      "bookAppointment",
      "editAppointment",
      "cancelAppointment",
      "queryAppointments",
      "searchAppointments",
    ];

    if (appointmentFunctions.includes(initialResponse.functionName)) {
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

  console.log("[Line adapters] functionResult:", functionResult);
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

// 🚀 NEW: Performance monitoring exports
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
  return {
    cache: conversationCache.getStats(),
    database: conversationDb.getServiceStatus(),
    keywords: importantKeywords.getAllKeywords(),
    aiCache: aiResponseCache.getStats(), // 🚀 NEW
    performance: performanceMonitor.getStats(), // 🚀 NEW
  };
}

// ✅ Keep your existing helper functions
function createCarResponse(summary, functionResult) {
  const cars = functionResult.rawData?.slice(0, 10) || [];
  if (cars.length > 0) {
    // Check if we should use enhanced Flex Message or simple text
    const useFlexMessage = process.env.LINE_ENABLE_FLEX_MESSAGES !== "false";

    if (useFlexMessage && process.env.LINE_LIFF_ID) {
      return createEnhancedCarResponse(
        summary,
        cars,
        functionResult.count,
        functionResult.query
      );
    } else {
      return createSimpleCarTextResponse(summary, cars, functionResult.count);
    }
  }
  return { type: "text", text: summary };
}

// ✅ Enhanced helper function to generate proper car detail URL
function generateCarDetailUrl(carData) {
  // If car already has a public_url, use it
  if (carData.public_url) {
    return carData.public_url;
  }

  // ✅ Use the proper URL generation function with car data structure
  const carForUrl = {
    id: carData.id,
    brand_name: carData.ยี่ห้อ || carData.brand_name,
    model_name: carData.รุ่น || carData.model_name,
    title: carData.รุ่นย่อย || carData.title || "",
    years_car: carData.รถปี || carData.years_car,
    no_car: carData.รหัสรถ || carData.no_car,
  };

  // Generate SEO-friendly URL
  return getCarDetailUrl(carForUrl, true); // absolute URL for LIFF
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

    // ✅ Generate proper LIFF URL with SEO-friendly slug
    const carDetailUrl = generateCarDetailUrl(car);
    if (carDetailUrl) {
      const liffUrl = createLiffUrl(carDetailUrl);
      message += `   รายละเอียด: ${liffUrl}\n`;
    }
    message += `\n`;
  });

  if (totalCount > 3) {
    // Create LIFF URL for all cars search
    const allCarsLiffUrl = createLiffUrl("/cars/search");
    message += `ดูรถทั้งหมด: ${allCarsLiffUrl}`;
  }

  return { type: "text", text: message };
}

// Helper function to create LIFF URLs
function createLiffUrl(path) {
  const liffId = process.env.LINE_LIFF_ID;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://services.ckc2car.com";

  if (!liffId) {
    console.warn("LINE_LIFF_ID not configured, using direct URL");
    return path.startsWith("http") ? path : `${baseUrl}${path}`;
  }

  // ✅ Handle absolute URLs (from generateCarDetailUrl)
  if (path.startsWith("http")) {
    // Extract the path part from absolute URL
    const url = new URL(path);
    path = url.pathname;
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Create LIFF URL
  const liffUrl = `https://liff.line.me/${liffId}${cleanPath}`;

  return liffUrl;
}

// ✅ Enhanced version with proper car detail URL generation
function createEnhancedCarResponse(summary, cars, totalCount, query = null) {
  const liffId = process.env.LINE_LIFF_ID;

  if (!liffId) {
    // Fallback to simple text response
    return createSimpleCarTextResponse(summary, cars, totalCount);
  }

  // Create Flex Message with LIFF integration
  const carItems = cars.slice(0, 3).map((car, index) => {
    // ✅ Generate proper car detail URL
    const carDetailUrl = generateCarDetailUrl(car);

    return {
      type: "box",
      layout: "vertical",
      margin: "lg",
      spacing: "sm",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: `${car.ยี่ห้อ} ${car.รุ่น} ${car.รถปี}`,
              weight: "bold",
              size: "sm",
              flex: 1,
            },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "ราคา:",
              size: "xs",
              color: "#666666",
              flex: 1,
            },
            {
              type: "text",
              text: `${Number(car.ราคา).toLocaleString("th-TH")} บาท`,
              size: "xs",
              color: "#FF6B6B",
              weight: "bold",
              flex: 2,
            },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "ผ่อน:",
              size: "xs",
              color: "#666666",
              flex: 1,
            },
            {
              type: "text",
              text: `${Number(car.ผ่อน).toLocaleString("th-TH")} บาท/เดือน`,
              size: "xs",
              color: "#4ECDC4",
              weight: "bold",
              flex: 2,
            },
          ],
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "สาขา:",
              size: "xs",
              color: "#666666",
              flex: 1,
            },
            {
              type: "text",
              text: car.สาขา || "ไม่ระบุ",
              size: "xs",
              color: "#333333",
              flex: 2,
            },
          ],
        },
        {
          type: "button",
          style: "primary",
          height: "sm",
          color: "#4ECDC4",
          margin: "md",
          action: {
            type: "uri",
            label: "ดูรายละเอียด",
            // ✅ Use the proper SEO-friendly URL
            uri: createLiffUrl(carDetailUrl),
          },
        },
      ],
    };
  });

  // Create footer with "View All" button
  const footerContents = [
    {
      type: "separator",
      margin: "lg",
    },
    {
      type: "box",
      layout: "horizontal",
      margin: "lg",
      contents: [
        {
          type: "text",
          text: `พบรถทั้งหมด ${totalCount} คัน`,
          size: "sm",
          color: "#666666",
          flex: 1,
        },
      ],
    },
  ];

  if (totalCount > 3) {
    const searchUrl = query
      ? createSearchLiffUrl(query)
      : createLiffUrl("/cars/search");
    footerContents.push({
      type: "button",
      style: "secondary",
      height: "sm",
      margin: "md",
      action: {
        type: "uri",
        label: "ดูรถทั้งหมด",
        uri: searchUrl,
      },
    });
  }

  return {
    type: "flex",
    altText: `พบรถ ${totalCount} คัน`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `🚗 พบรถ ${totalCount} คัน`,
            weight: "bold",
            size: "lg",
            color: "#4ECDC4",
          },
          {
            type: "text",
            text:
              summary.length > 100 ? summary.substring(0, 97) + "..." : summary,
            wrap: true,
            size: "sm",
            color: "#666666",
            margin: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: carItems,
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: footerContents,
      },
    },
  };
}

// Helper function to create search LIFF URL with query parameters
function createSearchLiffUrl(query) {
  const searchQuery = {
    ...query,
    page: 1,
    pageSize: 20,
    limit: null,
  };

  const queryParam = encodeURIComponent(JSON.stringify(searchQuery));
  const searchPath = `/cars/search?q=${queryParam}&from=line`;

  return createLiffUrl(searchPath);
}

// Also update the account linking prompt to use LIFF
function createAccountLinkingPrompt(lineUserId) {
  const loginPath = `/login?lineUserId=${lineUserId}&source=line`;
  const liffUrl = createLiffUrl(loginPath);

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
              uri: liffUrl,
            },
          },
        ],
      },
    },
  };
}
