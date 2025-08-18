import { processAIRequest, summarizeData } from "../core";
import { handleFunctionCalls } from "@/app/ai/tools"; // ✅ Use new tools system

/**
 * Process AI request for web platform, now with full function-calling orchestration.
 */
export async function processWebRequest(messages, context = {}, user) {
  try {
    console.log("[Web Adapter] 🎯 Processing request:", {
      messageCount: messages.length,
      userId: user?.id,
      platform: context?.platform || "web",
    });

    const initialResponse = await processAIRequest(messages, context, "web");

    console.log("[Web Adapter] 🔍 Initial AI response:", {
      type: initialResponse.type,
      functionName: initialResponse.functionName,
      hasArgs: !!initialResponse.args,
    });

    if (initialResponse.type === "function_call") {
      console.log("[Web Adapter] 🚀 Function call detected:", {
        functionName: initialResponse.functionName,
        args: initialResponse.args,
      });

      // ✅ Pass platform info to user object
      const enhancedUser = {
        ...user,
        platform: "web",
      };

      console.log("[Web Adapter] 🔧 Calling handleFunctionCalls with:", {
        functionName: initialResponse.functionName,
        user: enhancedUser,
      });

      const functionResult = await handleFunctionCalls(
        initialResponse.functionName,
        initialResponse.args,
        enhancedUser
      );

      console.log("[Web Adapter] 📋 Function result:", functionResult);

      // Functions that need summarization
      const functionsToSummarize = {
        queryCarsComprehensive: "cars",
        queryAppointments: "appointments",
        // Add more here in the future, e.g., queryCustomers: "customers"
      };

      const summaryType = functionsToSummarize[initialResponse.functionName];

      // Step 4: Check if the function was successful and needs summarization
      if (summaryType && functionResult.success && functionResult.count > 0) {
        console.log(
          `[Web Adapter] Summarizing data for type: '${summaryType}'`
        );

        // Get the final summary from the AI using the new summarizer
        const lastUserMessage =
          messages[messages.length - 1]?.content ||
          messages[messages.length - 1]?.text ||
          "รถทั้งหมด";

        const finalSummary = await summarizeData(
          functionResult.rawData,
          lastUserMessage,
          summaryType
        );

        // Step 5: Return the complete, summarized response to the client
        return {
          ...functionResult, // Includes success, query, count, preview, isQuery
          summary: finalSummary, // Overwrite the placeholder summary with the real AI-generated one
          functionCalls: [
            {
              name: initialResponse.functionName,
              args: initialResponse.args,
              result: functionResult,
            },
          ],
        };
      }

      // For other functions or failed queries, return the direct result
      return {
        ...functionResult,
        functionCalls: [
          {
            name: initialResponse.functionName,
            args: initialResponse.args,
            result: functionResult,
          },
        ],
      };
    } else {
      console.log("[Web Adapter] 📝 Text response, no function call");
    }

    // If it was a simple text response, return it directly
    return {
      success: true,
      summary: initialResponse.content,
      count: 0,
      preview: [],
      functionCalls: [],
    };
  } catch (error) {
    console.error("[Web Adapter] 💥 Error:", error);
    return {
      success: false,
      summary: "ขออภัยค่ะ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้งค่ะ",
      error: error.message,
      functionCalls: [],
    };
  }
}
