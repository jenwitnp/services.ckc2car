import { GoogleGenerativeAI } from "@google/generative-ai"; // Use the new package
import { tools } from "@/app/ai/tools";
import { getSystemPrompt } from "./prompts";
import { formatMessagesForGemini } from "./formatters";
import {
  getAppointmentSummaryPrompt,
  getCarSummaryPrompt,
} from "./summaryPrompt";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Core AI processing function - platform agnostic
 */

// This should now be defined and valid
if (!GEMINI_API_KEY) {
  throw new Error("GOOGLE_GEMINI_API_KEY is not defined");
}

// 1. Initialize with the correct class from the new package
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function processAIRequest(
  messages,
  context = {},
  platform = "web",
  config = {}
) {
  try {
    // 2. Get the generative model with tools and system instructions
    const model = genAI.getGenerativeModel({
      model: config.model || GEMINI_MODEL, // Using a modern model
      tools: tools,
      systemInstruction: getSystemPrompt(context, platform),
    });

    // 3. Format messages
    const formattedMessages = formatMessagesForGemini(messages, context);

    console.log(
      `[AI Core] Starting chat with ${formattedMessages.length} messages.`
    );

    // 4. Start a chat session and send the message history
    const chat = model.startChat({
      history: formattedMessages.slice(0, -1), // Send all but the last message as history
    });

    const lastMessage = formattedMessages[formattedMessages.length - 1];
    // --- NEW: Retry logic for API calls ---
    const MAX_RETRIES = 3;
    let result;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[AI Core] Attempt ${attempt} to send message...`);
        result = await chat.sendMessage(lastMessage.parts[0].text);
        lastError = null; // Clear last error on success
        break; // Exit loop if successful
      } catch (error) {
        lastError = error;
        // Check if it's a retryable error (like 503)
        if (error.message && error.message.includes("503")) {
          if (attempt < MAX_RETRIES) {
            const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s
            console.warn(
              `[AI Core] Model overloaded (503). Retrying in ${delay}ms...`
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } else {
          // If it's a different error (e.g., 400 Bad Request), throw immediately.
          throw error;
        }
      }
    }

    // If all retries failed, throw the last captured error to be handled by the adapter.
    if (lastError) {
      console.error(`[AI Core] All retries failed. Final error:`, lastError);
      throw lastError;
    }
    // --- END RETRY LOGIC ---

    // Process the response
    const response = result.response;
    const functionCalls = response.functionCalls();

    // Handle function calls if present
    if (functionCalls && functionCalls.length > 0) {
      const functionCall = functionCalls[0];
      console.log(`[AI Core] Function call detected: ${functionCall.name}`);
      return {
        type: "function_call",
        functionName: functionCall.name,
        args: functionCall.args,
        rawResponse: response.text() || "",
      };
    }

    // Return text response
    return {
      type: "text",
      content: response.text() || "",
    };
  } catch (error) {
    console.error(`[AI Core] Error processing request:`, error);
    // Provide more detailed error for debugging
    const errorMessage = error.details || error.message;
    return {
      type: "error",
      error: errorMessage,
    };
  }
}

// ... (keep existing imports and processAIRequest function) ...

/**
 * A generic function to summarize different types of data using the AI.
 * @param {Array} data - The array of data objects (e.g., cars, appointments).
 * @param {string} originalUserQuery - The user's original question.
 * @param {string} summaryType - The type of data to summarize ('cars', 'appointments', etc.).
 * @returns {Promise<string>} - A natural language summary.
 */
export async function summarizeData(data, originalUserQuery, summaryType) {
  console.log("[summary data] : ", data);
  if (!data || data.length === 0) {
    return "ขออภัยค่ะ ไม่พบข้อมูลที่ตรงกับความต้องการของคุณเลย";
  }

  if (!GEMINI_API_KEY) {
    throw new Error("GOOGLE_GEMINI_API_KEY is not defined");
  }

  let summaryPrompt;

  // Select the appropriate prompt based on the summary type
  switch (summaryType) {
    case "cars":
      summaryPrompt = getCarSummaryPrompt(data, originalUserQuery);
      break;
    case "appointments":
      summaryPrompt = getAppointmentSummaryPrompt(data, originalUserQuery);
      break;
    // Add more cases for 'customers', etc. in the future
    default:
      console.error(`Unknown summary type: ${summaryType}`);
      return "ขออภัยค่ะ ไม่สามารถสรุปข้อมูลประเภทนี้ได้";
  }

  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  try {
    const result = await model.generateContent(summaryPrompt);
    return result.response.text();
  } catch (error) {
    console.error(`Error summarizing ${summaryType} data:`, error);
    return "ขออภัยค่ะ เกิดข้อผิดพลาดในการสรุปข้อมูล";
  }
}
