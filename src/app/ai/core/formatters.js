/**
 * Format messages for Gemini API, ensuring the history starts with a 'user' role.
 * @param {Array} messages - Chat messages from the client.
 * @param {Object} context - Context data (currently unused but good for future).
 * @returns {Array} - A valid, formatted array of messages for the Gemini API.
 */
export function formatMessagesForGemini(messages, context) {
  // --- THE FIX ---
  // 1. Find the index of the first message with the 'user' role.
  const firstUserMessageIndex = messages.findIndex(
    (msg) => msg.role === "user"
  );

  // 2. If no user message exists (e.g., only AI greeting), return an empty array
  //    to prevent an error. The core processor will handle this gracefully.
  if (firstUserMessageIndex === -1) {
    return [];
  }

  // 3. Create a clean history that starts from the first user message.
  const cleanMessages = messages.slice(firstUserMessageIndex);
  // --- END FIX ---

  // 4. Map the cleaned messages to the format required by the Gemini API.
  return cleanMessages.map((msg) => {
    // Map internal 'assistant' role to 'model' for the API.
    const role = msg.role === "assistant" ? "model" : msg.role;
    return {
      role: role,
      parts: [{ text: msg.content || msg.text || "" }],
    };
  });
}
