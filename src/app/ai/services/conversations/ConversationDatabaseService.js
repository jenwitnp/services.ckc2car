import supabase from "@/app/services/supabase";
import { apiFactory } from "@/app/services/api/ApiFactory";

export class ConversationDatabaseService {
  constructor(config = {}) {
    this.retentionDays = config.retentionDays || 7;
    this.maxContextMessages = config.maxContextMessages || 4;
    this.cleanupProbability = config.cleanupProbability || 0.005;
  }

  /**
   * 📥 Load minimal context from database
   */
  async loadMinimalContext(userId, platform) {
    try {
      console.log(`[DB Service] Loading context for user ${userId}`);

      const retentionCutoff = new Date();
      retentionCutoff.setDate(retentionCutoff.getDate() - this.retentionDays);

      const userIdColumn = platform === "line" ? "line_user_id" : "user_id";

      const { data: messages, error } = await supabase
        .from("line_conversations")
        .select("message_role, message_content, created_at")
        .eq(userIdColumn, userId)
        .eq("platform", platform) // <-- filter by platform as well
        .gte("created_at", retentionCutoff.toISOString())
        .order("created_at", { ascending: false })
        .limit(this.maxContextMessages);

      if (error) {
        console.error("[DB Service] Error loading context:", error);
        return { success: false, messages: [], error: error.message };
      }

      const formattedMessages = messages.reverse().map((msg) => ({
        role: msg.message_role,
        content: msg.message_content,
        timestamp: msg.created_at,
      }));

      console.log(`[DB Service] Loaded ${formattedMessages.length} messages`);

      return {
        success: true,
        messages: formattedMessages,
        count: formattedMessages.length,
      };
    } catch (error) {
      console.error("[DB Service] Exception loading context:", error);
      return { success: false, messages: [], error: error.message };
    }
  }

  /**
   * 💾 Save important conversation to database
   */
  async saveImportantConversation(
    userId,
    userMessage,
    assistantMessage,
    options = {}
  ) {
    try {
      console.log(
        `[DB Service] Saving important conversation for user ${userId}`
      );

      const {
        functionCallData = null,
        importance = "high",
        platform,
      } = options;

      console.log("[DB converstation] option :", options);

      // Get CRM user ID if available
      const crmUserId = await this.getCrmUserId(userId, platform);

      // Generate conversation ID
      const conversationId = `important_${userId}_${Date.now()}`;

      // Prepare records
      const records = [
        this.createMessageRecord(
          userId,
          crmUserId,
          conversationId,
          userMessage,
          null,
          importance,
          platform
        ),
        this.createMessageRecord(
          userId,
          crmUserId,
          conversationId,
          assistantMessage,
          functionCallData,
          importance,
          platform
        ),
      ];

      console.log("[DB conversation Service] record conversation : ", records);

      const { error } = await supabase
        .from("line_conversations")
        .insert(records);

      if (error) {
        console.error("[DB Service] Error saving conversation:", error);
        return { success: false, error: error.message };
      }

      console.log("[DB Service] Important conversation saved successfully");
      return {
        success: true,
        conversationId,
        recordCount: records.length,
      };
    } catch (error) {
      console.error("[DB Service] Exception saving conversation:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🧹 Cleanup old conversations
   */
  async cleanupOldConversations() {
    try {
      console.log("[DB Service] Starting cleanup process");

      const { data: deletedCount, error } = await supabase.rpc(
        "cleanup_old_line_conversations"
      );

      if (error) {
        console.error("[DB Service] Cleanup error:", error);
        return { success: false, error: error.message, deletedCount: 0 };
      }

      console.log(
        `[DB Service] Cleanup completed: ${deletedCount} records deleted`
      );
      return { success: true, deletedCount };
    } catch (error) {
      console.error("[DB Service] Exception during cleanup:", error);
      return { success: false, error: error.message, deletedCount: 0 };
    }
  }

  /**
   * 📊 Get conversation statistics
   */
  async getConversationStats(userId = null) {
    try {
      let query = supabase
        .from("line_conversations")
        .select("line_user_id, created_at, metadata");

      if (userId) {
        query = query.eq("line_user_id", userId);
      }

      const { data, error } = await query
        .gte(
          "created_at",
          new Date(
            Date.now() - this.retentionDays * 24 * 60 * 60 * 1000
          ).toISOString()
        )
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) {
        console.error("[DB Service] Error getting stats:", error);
        return { success: false, error: error.message };
      }

      const stats = this.calculateStats(data, userId);

      return { success: true, stats };
    } catch (error) {
      console.error("[DB Service] Exception getting stats:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 🔍 Search conversations
   */
  async searchConversations(searchTerm, options = {}) {
    try {
      const {
        userId = null,
        limit = 50,
        importance = null,
        dateFrom = null,
        dateTo = null,
      } = options;

      let query = supabase
        .from("line_conversations")
        .select("*")
        .ilike("message_content", `%${searchTerm}%`);

      if (userId) query = query.eq("line_user_id", userId);
      if (importance) query = query.eq("metadata->>importance", importance);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("[DB Service] Search error:", error);
        return { success: false, error: error.message, results: [] };
      }

      console.log(`[DB Service] Found ${data.length} search results`);
      return { success: true, results: data, count: data.length };
    } catch (error) {
      console.error("[DB Service] Exception during search:", error);
      return { success: false, error: error.message, results: [] };
    }
  }

  /**
   * 🗑️ Delete user conversations
   */
  async deleteUserConversations(userId, beforeDate = null) {
    try {
      console.log(`[DB Service] Deleting conversations for user ${userId}`);

      let query = supabase
        .from("line_conversations")
        .delete()
        .eq("line_user_id", userId);

      if (beforeDate) {
        query = query.lt("created_at", beforeDate);
      }

      const { error, count } = await query;

      if (error) {
        console.error("[DB Service] Delete error:", error);
        return { success: false, error: error.message, deletedCount: 0 };
      }

      console.log(
        `[DB Service] Deleted ${count} conversations for user ${userId}`
      );
      return { success: true, deletedCount: count };
    } catch (error) {
      console.error("[DB Service] Exception during delete:", error);
      return { success: false, error: error.message, deletedCount: 0 };
    }
  }

  /**
   * 🔧 HELPER: Get CRM user ID
   */
  async getCrmUserId(userId, platform) {
    try {
      const userCheck = await apiFactory.users.checkLineExist(userId, platform);
      return userCheck.exists ? userCheck.user.id : null;
    } catch (error) {
      console.log(`[DB Service] Could not get CRM user ID: ${error.message}`);
      return null;
    }
  }

  /**
   * 🔧 HELPER: Create message record
   */
  createMessageRecord(
    lineUserId,
    crmUserId,
    conversationId,
    message,
    functionCallData,
    importance,
    platform
  ) {
    return {
      line_user_id: lineUserId,
      user_id: crmUserId,
      conversation_id: conversationId,
      message_role: message.role,
      message_content: message.content,
      function_call: functionCallData,
      metadata: {
        importance,
        timestamp: new Date().toISOString(),
        platform,
        cache_strategy: "important",
        message_length: message.content?.length || 0,
        has_function_call: !!functionCallData,
      },
      platform,
    };
  }

  /**
   * 🔧 HELPER: Calculate statistics
   */
  calculateStats(data, userId) {
    const now = Date.now();
    const stats = {
      totalConversations: 0,
      totalMessages: data.length,
      importantMessages: 0,
      functionCalls: 0,
      averageMessageLength: 0,
      timeDistribution: { today: 0, thisWeek: 0, older: 0 },
      userSpecific: !!userId,
    };

    if (userId) {
      stats.userId = userId;
    }

    const conversationIds = new Set();
    let totalLength = 0;

    data.forEach((record) => {
      conversationIds.add(record.conversation_id);

      if (record.metadata?.importance === "high") {
        stats.importantMessages++;
      }

      if (record.function_call) {
        stats.functionCalls++;
      }

      const messageLength =
        record.metadata?.message_length || record.message_content?.length || 0;
      totalLength += messageLength;

      // Time distribution
      const recordTime = new Date(record.created_at).getTime();
      const daysDiff = (now - recordTime) / (1000 * 60 * 60 * 24);

      if (daysDiff < 1) {
        stats.timeDistribution.today++;
      } else if (daysDiff < 7) {
        stats.timeDistribution.thisWeek++;
      } else {
        stats.timeDistribution.older++;
      }
    });

    stats.totalConversations = conversationIds.size;
    stats.averageMessageLength =
      data.length > 0 ? Math.round(totalLength / data.length) : 0;

    return stats;
  }

  /**
   * 🔧 HELPER: Random cleanup check
   */
  shouldTriggerCleanup() {
    return Math.random() < this.cleanupProbability;
  }

  /**
   * ⚙️ Update configuration
   */
  updateConfig(newConfig) {
    if (newConfig.retentionDays) this.retentionDays = newConfig.retentionDays;
    if (newConfig.maxContextMessages)
      this.maxContextMessages = newConfig.maxContextMessages;
    if (newConfig.cleanupProbability)
      this.cleanupProbability = newConfig.cleanupProbability;

    console.log(`[DB Service] Configuration updated:`, {
      retentionDays: this.retentionDays,
      maxContextMessages: this.maxContextMessages,
      cleanupProbability: this.cleanupProbability,
    });
  }

  /**
   * 📋 Get service status
   */
  getServiceStatus() {
    return {
      service: "ConversationDatabaseService",
      config: {
        retentionDays: this.retentionDays,
        maxContextMessages: this.maxContextMessages,
        cleanupProbability: this.cleanupProbability,
      },
      features: {
        contextLoading: true,
        importantSaving: true,
        autoCleanup: true,
        search: true,
        analytics: true,
      },
    };
  }
}

// Export singleton instance
export const conversationDb = new ConversationDatabaseService({
  retentionDays: 7,
  maxContextMessages: 4,
  cleanupProbability: 0.005,
});
