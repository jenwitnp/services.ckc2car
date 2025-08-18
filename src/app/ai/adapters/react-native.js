import { processAIRequest, summarizeData } from "../core";
import { handleFunctionCalls } from "@/app/ai/tools"; // ✅ Use new tools system

/**
 * Process AI request for React Native platform
 *
 * @param {Array} messages - Chat message history
 * @param {Object} context - Context data
 * @param {Object} user - User information
 * @returns {Promise<Object>} Mobile-optimized response
 */
export async function processReactNativeRequest(messages, context = {}, user) {
  try {
    console.log("[React Native Adapter] Processing request:", {
      messageCount: messages.length,
      userId: user?.id,
      platform: "react-native",
    });

    // Step 1: Get the initial response from the AI
    const initialResponse = await processAIRequest(
      messages,
      context,
      "react-native"
    );

    // Step 2: Check if the AI wants to call a function
    if (initialResponse.type === "function_call") {
      console.log(
        "[React Native Adapter] Function call requested:",
        initialResponse.functionName
      );

      // Step 3: Execute the function
      const functionResult = await handleFunctionCalls(
        initialResponse.functionName,
        initialResponse.args,
        user
      );

      // Step 4: Optimize for mobile
      const optimizedResult = {
        ...functionResult,
        preview: functionResult.rawData
          ? optimizePreviewForMobile(functionResult.rawData)
          : [],
        functionCalls: [
          {
            name: initialResponse.functionName,
            args: initialResponse.args,
            result: functionResult,
          },
        ],
      };

      // Step 5: Summarize if needed
      if (functionResult.success && functionResult.count > 0) {
        const summaryType =
          initialResponse.functionName === "queryCarsComprehensive"
            ? "cars"
            : initialResponse.functionName === "queryAppointments"
            ? "appointments"
            : null;

        if (summaryType) {
          const lastUserMessage =
            messages[messages.length - 1]?.content ||
            messages[messages.length - 1]?.text ||
            "ข้อมูล";

          const finalSummary = await summarizeData(
            functionResult.rawData,
            lastUserMessage,
            summaryType
          );

          optimizedResult.summary = finalSummary;
        }
      }

      return optimizedResult;
    }

    // Simple text response
    return {
      success: true,
      summary: initialResponse.content,
      count: 0,
      preview: [],
      functionCalls: [],
    };
  } catch (error) {
    console.error("[React Native Adapter] Error:", error);
    return {
      success: false,
      summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล",
      error: error.message,
      preview: [],
      functionCalls: [],
    };
  }
}

/**
 * Optimize preview data for mobile display
 */
function optimizePreviewForMobile(rawData) {
  if (!Array.isArray(rawData)) return [];

  return rawData.slice(0, 5).map((item) => ({
    id: item.id,
    title: truncate(item.ชื่อสินค้า || item.title || "", 30),
    brand: item.ยี่ห้อ || item.brand_name || "",
    price: formatPrice(item.ราคา || item.price || 0),
    image: item.url || item.public_url || null,
  }));
}

// Helper functions
function truncate(str, length) {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

function formatPrice(price) {
  if (!price || price === 0) return "ราคาติดต่อ";
  return new Intl.NumberFormat("th-TH").format(price) + " บาท";
}
