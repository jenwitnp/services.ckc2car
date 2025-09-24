import supabase from "@/app/services/supabase";

export const lineConfigService = {
  // Get current active configuration
  async getConfig() {
    try {
      const { data, error } = await supabase
        .from("line_configs")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error getting config:", error);
        throw error;
      }

      // Return default config if none exists
      if (!data) {
        return {
          mode: "auto",
          auto_response_delay: 0,
          enable_smart_response: true,
          business_hours_enabled: true,
          business_hours_start: "09:00",
          business_hours_end: "18:00",
          business_hours_timezone: "Asia/Bangkok",
          active: true,
        };
      }

      return data;
    } catch (error) {
      console.error("Error getting config:", error);
      throw error;
    }
  },

  // Save new configuration with proper time formatting
  async saveConfig(config) {
    try {
      // Deactivate current config
      await supabase
        .from("line_configs")
        .update({ active: false })
        .eq("active", true);

      // Format time values properly
      const formatTime = (timeStr) => {
        if (!timeStr) return "09:00:00";
        // If it's already in HH:MM:SS format, return as is
        if (timeStr.includes(":") && timeStr.split(":").length === 3) {
          return timeStr;
        }
        // If it's HH:MM format, add :00
        if (timeStr.includes(":") && timeStr.split(":").length === 2) {
          return `${timeStr}:00`;
        }
        // Default fallback
        return "09:00:00";
      };

      // Prepare config data with proper time formatting
      const configData = {
        mode: config.mode,
        auto_response_delay: config.autoResponseDelay || 0,
        enable_smart_response: config.enableSmartResponse !== false,
        business_hours_enabled: config.businessHours?.enabled !== false,
        business_hours_start: formatTime(config.businessHours?.start),
        business_hours_end: formatTime(config.businessHours?.end),
        business_hours_timezone:
          config.businessHours?.timezone || "Asia/Bangkok",
        business_hours_after_hours_message:
          config.businessHours?.afterHoursMessage,
        template_greeting: config.smartResponse?.templates?.greeting,
        template_car_inquiry: config.smartResponse?.templates?.carInquiry,
        template_pricing: config.smartResponse?.templates?.pricing,
        template_contact: config.smartResponse?.templates?.contact,
        ai_use_context: config.smartResponse?.aiSettings?.useContext !== false,
        ai_use_car_data: config.smartResponse?.aiSettings?.useCarData !== false,
        ai_max_length: config.smartResponse?.aiSettings?.maxLength || 200,
        ai_naturalness: config.smartResponse?.aiSettings?.naturalness || 0.7,
        notify_new_message: config.notifications?.newMessage !== false,
        notify_after_hours: config.notifications?.afterHours || false,
        notify_ai_error: config.notifications?.aiError !== false,
        notify_line_notify:
          config.notifications?.channels?.lineNotify !== false,
        notify_email: config.notifications?.channels?.email || false,
        notify_webhook: config.notifications?.channels?.webhook || false,
        active: true,
      };

      console.log("Saving config with formatted times:", {
        start: configData.business_hours_start,
        end: configData.business_hours_end,
        enabled: configData.business_hours_enabled,
      });

      // Insert new config
      const { data, error } = await supabase
        .from("line_configs")
        .insert(configData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving config:", error);
      throw error;
    }
  },

  // Get daily stats
  async getDailyStats(date = new Date().toISOString().split("T")[0]) {
    try {
      // First try to get from line_message_stats
      const { data: statsData, error: statsError } = await supabase
        .from("line_message_stats")
        .select("*")
        .eq("date", date)
        .single();

      if (statsData) {
        return statsData;
      }

      // Fallback: Calculate from line_admin_conversations
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const { data: conversationData, error: conversationError } =
        await supabase
          .from("line_admin_conversations")
          .select("*")
          .gte("created_at", startDate.toISOString())
          .lt("created_at", endDate.toISOString());

      if (conversationError) throw conversationError;

      // Calculate stats from conversation data
      const stats = {
        date,
        total_messages: conversationData.length,
        incoming_messages: conversationData.filter(
          (msg) => msg.message_role === "user"
        ).length,
        outgoing_messages: conversationData.filter(
          (msg) => msg.message_role === "admin"
        ).length,
        admin_responses: conversationData.filter(
          (msg) =>
            msg.message_role === "admin" &&
            msg.metadata?.auto_generated !== true
        ).length,
        auto_responses: conversationData.filter(
          (msg) =>
            msg.message_role === "admin" &&
            msg.metadata?.auto_generated === true
        ).length,
        ai_responses: conversationData.filter(
          (msg) =>
            msg.message_role === "admin" && msg.metadata?.response_mode === "ai"
        ).length,
        unique_users: [
          ...new Set(conversationData.map((msg) => msg.line_user_id)),
        ].length,
        avg_response_time_seconds: 1.2,
      };

      // Save calculated stats
      await supabase
        .from("line_message_stats")
        .upsert(stats, { onConflict: "date" });

      return stats;
    } catch (error) {
      console.error("Error getting daily stats:", error);
      // Return default stats
      return {
        date,
        total_messages: 0,
        incoming_messages: 0,
        outgoing_messages: 0,
        admin_responses: 0,
        auto_responses: 0,
        ai_responses: 0,
        unique_users: 0,
        avg_response_time_seconds: 0,
      };
    }
  },

  // Get keywords
  async getKeywords() {
    try {
      const { data, error } = await supabase
        .from("line_keywords")
        .select("*")
        .order("usage_count", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error getting keywords:", error);
      return [];
    }
  },

  // Log conversation message
  async logMessage(messageData) {
    try {
      const { data, error } = await supabase
        .from("line_admin_conversations")
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error logging message:", error);
      throw error;
    }
  },
};
