import { LineUtilsService } from "@/app/ai/adapters/line/services/LineUtilsService.js";
import { saveData, fetchData } from "@/app/services/supabase/query.js";

export class AdminConversationService {
  /**
   * ✅ Save conversation message to database
   */
  static async saveConversationMessage(messageData) {
    try {
      console.log("Saving message to line_admin_conversations:", {
        line_user_id: messageData.line_user_id,
        message_role: messageData.message_role,
        message_type: messageData.message_type,
        conversation_session_id: messageData.conversation_session_id,
        has_admin_id: !!messageData.admin_id,
        has_admin_name: !!messageData.admin_name,
        metadata_keys: Object.keys(messageData.metadata || {}),
      });

      const result = await saveData("line_admin_conversations", messageData);
      console.log("Message saved successfully:", result);
      return result;
    } catch (error) {
      console.error("Error saving conversation message:", error);
      console.error("Message data:", messageData);
      throw error;
    }
  }

  /**
   * ✅ Get conversations with filters
   */
  static async getConversations(lineUserId, date) {
    try {
      const options = {
        sort: ["created_at", "desc"],
        limit: 100,
      };

      if (lineUserId) {
        options.filters = { line_user_id: lineUserId };
      }

      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);

        options.gte = { created_at: startDate.toISOString() };
        options.lte = { created_at: endDate.toISOString() };
      }

      const result = await fetchData("line_admin_conversations", options);

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch conversations");
      }

      return {
        success: true,
        data: result.data || [],
        meta: {
          total: result.data?.length || 0,
          count: result.count || 0,
          filtered_by: {
            line_user_id: lineUserId || "all",
            date: date || "all",
          },
        },
      };
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  /**
   * ✅ Get daily statistics
   */
  static async getDailyStats(date) {
    try {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const result = await fetchData("line_admin_conversations", {
        gte: { created_at: startDate.toISOString() },
        lte: { created_at: endDate.toISOString() },
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch conversations");
      }

      const conversations = result.data || [];

      const stats = {
        date: date,
        total_messages: conversations.length,
        user_messages: conversations.filter((c) => c.message_role === "user")
          .length,
        admin_responses: conversations.filter((c) => c.message_role === "admin")
          .length,
        unique_users: [...new Set(conversations.map((c) => c.line_user_id))]
          .length,
        auto_responses: conversations.filter(
          (c) =>
            c.message_role === "admin" && c.metadata?.auto_generated === true
        ).length,
        response_modes: {},
      };

      conversations
        .filter((c) => c.message_role === "admin")
        .forEach((c) => {
          const mode = c.metadata?.response_mode || "unknown";
          stats.response_modes[mode] = (stats.response_modes[mode] || 0) + 1;
        });

      return stats;
    } catch (error) {
      console.error("Error getting daily stats:", error);
      return {
        date: date,
        error: error.message,
        total_messages: 0,
        user_messages: 0,
        admin_responses: 0,
        unique_users: 0,
        auto_responses: 0,
        response_modes: {},
      };
    }
  }

  /**
   * ✅ Get conversation statistics
   */
  static async getConversationStats() {
    try {
      const result = await fetchData("line_admin_conversations", {
        sort: ["created_at", "desc"],
        limit: 1000,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to fetch conversations");
      }

      const conversations = result.data || [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayMessages = conversations.filter(
        (c) => new Date(c.created_at) >= today
      );

      const yesterdayMessages = conversations.filter((c) => {
        const msgDate = new Date(c.created_at);
        return msgDate >= yesterday && msgDate < today;
      });

      return {
        total_conversations: conversations.length,
        today: {
          total: todayMessages.length,
          users: todayMessages.filter((c) => c.message_role === "user").length,
          admins: todayMessages.filter((c) => c.message_role === "admin")
            .length,
          unique_users: [...new Set(todayMessages.map((c) => c.line_user_id))]
            .length,
        },
        yesterday: {
          total: yesterdayMessages.length,
          users: yesterdayMessages.filter((c) => c.message_role === "user")
            .length,
          admins: yesterdayMessages.filter((c) => c.message_role === "admin")
            .length,
          unique_users: [
            ...new Set(yesterdayMessages.map((c) => c.line_user_id)),
          ].length,
        },
        unique_users_total: [
          ...new Set(conversations.map((c) => c.line_user_id)),
        ].length,
        last_activity: conversations[0]?.created_at || null,
      };
    } catch (error) {
      console.error("Error getting conversation stats:", error);
      return {
        error: error.message,
        total_conversations: 0,
        today: { total: 0, users: 0, admins: 0, unique_users: 0 },
        yesterday: { total: 0, users: 0, admins: 0, unique_users: 0 },
        unique_users_total: 0,
        last_activity: null,
      };
    }
  }
}
