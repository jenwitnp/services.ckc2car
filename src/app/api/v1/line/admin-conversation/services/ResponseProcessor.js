import { ModeHandlers } from "../handlers/modeHandlers.js";

export class ResponseProcessor {
  /**
   * ✅ Process admin response based on configuration
   */
  static async processAdminResponse(messageContent, lineUserId, event, config) {
    try {
      console.log("[Admin Response] Processing with config:", {
        mode: config.mode,
        enableSmartResponse: config.enableSmartResponse,
        businessHoursEnabled: config.businessHours.enabled,
      });

      // Check business hours first
      const businessHoursResponse = ModeHandlers.handleBusinessHours(config);
      if (businessHoursResponse) {
        return businessHoursResponse;
      }

      // Route to appropriate mode handler
      switch (config.mode) {
        case "manual":
          return ModeHandlers.handleManualMode(messageContent, config);

        case "auto":
          return ModeHandlers.handleAutoMode(messageContent, config);

        case "hybrid":
          return await ModeHandlers.handleHybridMode(
            messageContent,
            lineUserId,
            config
          );

        case "ai":
          if (config.enableSmartResponse) {
            return await ModeHandlers.handleAIMode(
              messageContent,
              lineUserId,
              config
            );
          }
          break;

        default:
          console.warn(`[Admin Response] Unknown mode: ${config.mode}`);
          break;
      }

      // Ultimate fallback for AI mode or unknown modes
      return ModeHandlers.getFallbackResponse();
    } catch (error) {
      console.error("Error processing admin response:", error);
      return { shouldSend: false };
    }
  }
}
