import { AdminConversationService } from "../services/AdminConversationService.js";
import { ConfigService } from "../services/ConfigService.js";

export class GetRequestHandler {
  /**
   * ✅ Handle GET requests
   */
  static async handleGetRequest(searchParams) {
    const action = searchParams.get("action");

    switch (action) {
      case "config":
        return await this.handleConfigRequest();

      case "daily_summary":
        const date =
          searchParams.get("date") || new Date().toISOString().split("T")[0];
        return await this.handleDailySummaryRequest(date);

      case "conversations":
        const lineUserId = searchParams.get("userId");
        const conversationDate = searchParams.get("date");
        return await this.handleConversationsRequest(
          lineUserId,
          conversationDate
        );

      case "stats":
        return await this.handleStatsRequest();

      default:
        throw new Error("Invalid action");
    }
  }

  /**
   * ✅ Handle config request
   */
  static async handleConfigRequest() {
    const config = await ConfigService.getAdminResponseConfig();
    return {
      success: true,
      config: {
        mode: config.mode,
        autoResponseDelay: config.autoResponseDelay,
        enableSmartResponse: config.enableSmartResponse,
        businessHours: {
          enabled: config.businessHours.enabled,
          start: config.businessHours.start,
          end: config.businessHours.end,
          timezone: config.businessHours.timezone,
        },
      },
    };
  }

  /**
   * ✅ Handle daily summary request
   */
  static async handleDailySummaryRequest(date) {
    const stats = await AdminConversationService.getDailyStats(date);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * ✅ Handle conversations request
   */
  static async handleConversationsRequest(lineUserId, conversationDate) {
    const result = await AdminConversationService.getConversations(
      lineUserId,
      conversationDate
    );
    return result;
  }

  /**
   * ✅ Handle stats request
   */
  static async handleStatsRequest() {
    const statsData = await AdminConversationService.getConversationStats();
    return {
      success: true,
      data: statsData,
    };
  }
}
