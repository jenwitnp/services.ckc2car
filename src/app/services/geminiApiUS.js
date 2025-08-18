import { fetchData, saveData } from "./supabase/query";
import { createAppointment, editAppointment } from "./supabase/appointment";
import { allTools } from "../ai/tools";

export const tools = [
  {
    functionDeclarations: allTools.map((tool) => tool.definition),
  },
];

const toolHandlers = allTools.reduce((acc, tool) => {
  acc[tool.definition.name] = tool.handler;
  return acc;
}, {});

export async function handleFunctionCalls(functionName, args, user) {
  console.log("Function to call: " + functionName);
  console.log("Arguments: " + JSON.stringify(args));

  const handler = toolHandlers[functionName];

  if (handler) {
    // The handler from the specific tool file (e.g., appointmentTool.js) is called
    return handler(args, user);
  } else {
    // Handle cases where the function name is not recognized
    console.warn(`Unknown function call: ${functionName}`);
    return {
      success: false,
      summary: `ไม่รู้จักคำสั่ง ${functionName}`,
      error: "Unknown function",
    };
  }
}

// Update chatWithGemini to use the new handleFunctionCall function
export async function chatWithGemini(messages) {
  var geminiMessages = messages.map(function (msg) {
    return {
      role: msg.role,
      parts: [{ text: msg.content }],
    };
  });

  // Send request with function declarations
  var response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: geminiMessages,
    config: {
      tools: tools,
      toolConfig: {
        functionCalling: {
          mode: "AUTO",
        },
      },
    },
  });

  // Check for function calls in the response
  if (response.functionCalls && response.functionCalls.length > 0) {
    var functionCall = response.functionCalls[0];

    // Use the extracted function handler
    return handleFunctionCall(functionCall.name, functionCall.args);
  } else {
    // If no function call is found, respond with Gemini's text response
    console.log("No function call found in the response.");
    console.log("no function call message", response.text);
    return {
      success: true,
      summary: response.text,
      count: 0,
      preview: [],
    };
  }
}

// Legacy compatibility wrapper - forwards to new tools system
import { handleFunctionCalls } from "@/app/ai/tools";

// Simple wrapper for backward compatibility
export { handleFunctionCalls };

// If you had other exports, add them here or migrate them to the new system
export default {
  handleFunctionCalls,
};
