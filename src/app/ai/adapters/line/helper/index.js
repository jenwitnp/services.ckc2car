// ✅ Core helpers
export {
  handleAIResponse,
  loadContextMessages,
  cacheConversationMessages,
  saveImportantConversation,
} from "./contextHelpers.js";

export {
  executeFunctionCall,
  handleFunctionResponse,
} from "./functionHandlers.js";

// ✅ UNIFIED response builder (replaces both LineResponseBuilder and responseHelpers)
export { LineResponseBuilder } from "./responseBuilder.js";

// ✅ Business hours helper
export { checkBusinessHours } from "./businessHours.js";

// ✅ Create convenient aliases for common functions
export const createTextResponse = (text) =>
  LineResponseBuilder.createTextResponse(text);
export const createCarResponse = (summary, functionResult) =>
  LineResponseBuilder.createCarResponse(summary, functionResult);
export const createErrorResponse = (message) =>
  LineResponseBuilder.createErrorResponse(message);
export const createAccountLinkingPrompt = (lineUserId) =>
  LineResponseBuilder.createAccountLinkingPrompt(lineUserId);
