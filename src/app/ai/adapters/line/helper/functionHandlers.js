import { handleFunctionCalls } from "@/app/ai/tools";
import { summarizeData } from "@/app/ai/core";
import { apiFactory } from "@/app/services/api/ApiFactory";
import { createCarResponse, createAccountLinkingPrompt } from "./index.js";

/**
 * ✅ Handle AI response and function calls
 */
export async function handleAIResponse(initialResponse, context, text) {
  let aiResponse;
  let functionCallData = null;

  if (initialResponse.type === "function_call") {
    console.log("[LINE Adapter] Function call:", initialResponse.functionName);

    functionCallData = {
      function_name: initialResponse.functionName,
      arguments: initialResponse.args,
    };

    // ✅ Check function type and route accordingly
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

/**
 * ✅ Handle appointment functions with user verification
 */
export async function handleAppointmentFunction(
  initialResponse,
  context,
  text
) {
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

/**
 * ✅ Handle general functions (cars, etc.)
 */
export async function handleGeneralFunction(initialResponse, text) {
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
