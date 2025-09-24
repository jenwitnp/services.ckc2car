"use client";

import { createContext, useContext, useState, useEffect } from "react";

const LineConfigContext = createContext();

export function useLineConfig() {
  const context = useContext(LineConfigContext);
  if (!context) {
    throw new Error("useLineConfig must be used within LineConfigProvider");
  }
  return context;
}

export function LineConfigProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Configuration states
  const [config, setConfig] = useState({
    mode: "auto",
    autoResponseDelay: 0,
    enableSmartResponse: true,
    businessHours: {
      enabled: true,
      start: "09:00",
      end: "18:00",
      timezone: "Asia/Bangkok",
    },
    templates: {
      greeting: "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services",
      carInquiry: "ขอบคุณที่สนใจรถของเราครับ/ค่ะ",
      pricing: "เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ",
      contact: "แอดมินจะติดต่อกลับไปให้ท่านครับ/ค่ะ",
    },
    ai: {
      useContext: true,
      useCarData: true,
      maxLength: 200,
      naturalness: 0.7,
    },
    notifications: {
      newMessage: true,
      afterHours: false,
      aiError: true,
      lineNotify: true,
      email: false,
      webhook: false,
    },
  });

  // Statistics state
  const [stats, setStats] = useState({
    todayMessages: 0,
    todayResponses: 0,
    avgResponseTime: "0s",
    uniqueUsers: 0,
    autoResponseRate: "0%",
  });

  // ✅ Load configuration
  const loadConfig = async () => {
    try {
      setLoading(true);
      console.log("[LineConfig] Loading configuration...");

      const response = await fetch("/api/v1/line/ui-config?action=config", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log("config result : ", result);

      console.log("[LineConfig] Configuration loaded:", {
        success: result.success,
        hasConfig: !!result.config,
        mode: result.config?.mode,
        isDefault: result.metadata?.isDefault,
      });

      if (result.success) {
        setConfig(result.config);

        if (result.metadata?.isDefault) {
          console.warn(
            "[LineConfig] Using default configuration due to loading error"
          );
        }
      } else {
        console.error("[LineConfig] Failed to load config:", result.error);
      }
    } catch (error) {
      console.error("[LineConfig] Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load statistics
  const loadStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      console.log("[LineConfig] Loading daily stats for:", today);

      const response = await fetch(
        `/api/v1/line/ui-config?action=daily_summary&date=${today}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      console.log("[LineConfig] Daily stats loaded:", {
        success: result.success,
        totalMessages: result.data?.total_messages,
        isMock: result.metadata?.isMock,
      });

      if (result.success) {
        const data = result.data;
        setStats({
          todayMessages: data.total_messages,
          todayResponses: data.admin_responses,
          avgResponseTime: data.avg_response_time,
          uniqueUsers: data.unique_users,
          autoResponseRate: `${data.auto_response_rate}%`,
        });

        if (result.metadata?.isMock) {
          console.warn("[LineConfig] Using mock stats due to loading error");
        }
      }
    } catch (error) {
      console.error("[LineConfig] Failed to load stats:", error);
    }
  };

  // ✅ Save configuration
  const saveConfig = async () => {
    try {
      setSaving(true);

      console.log("[LineConfig] Saving configuration:", {
        mode: config.mode,
        businessHoursEnabled: config.businessHours?.enabled,
        smartResponse: config.enableSmartResponse,
      });

      const response = await fetch("/api/v1/line/ui-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      console.log("[LineConfig] Save response:", {
        success: result.success,
        configId: result.data?.id,
      });

      if (result.success) {
        alert("บันทึกการตั้งค่าเรียบร้อย");
        console.log("[LineConfig] Configuration saved successfully");
        return true;
      } else {
        throw new Error(result.error || "Failed to save config");
      }
    } catch (error) {
      console.error("[LineConfig] Failed to save config:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ✅ Test response
  const testResponse = async (testMessage) => {
    if (!testMessage.trim()) return null;

    try {
      console.log("[LineConfig] Testing response:", {
        message: testMessage.substring(0, 50) + "...",
        mode: config.mode,
      });

      const response = await fetch("/api/v1/line/admin-conversation/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: testMessage,
          mode: config.mode,
          config: config,
        }),
      });

      const result = await response.json();

      console.log("[LineConfig] Test response:", {
        success: result.success,
        hasResponse: !!result.response,
        mode: result.mode,
        processingTime: result.processingTime,
      });

      return result;
    } catch (error) {
      console.error("[LineConfig] Test failed:", error);
      return {
        error: true,
        message: "เกิดข้อผิดพลาดในการทดสอบ: " + error.message,
      };
    }
  };

  // Load data on mount
  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const value = {
    // State
    config,
    setConfig,
    stats,
    loading,
    saving,

    // Actions
    loadConfig,
    loadStats,
    saveConfig,
    testResponse,
  };

  return (
    <LineConfigContext.Provider value={value}>
      {children}
    </LineConfigContext.Provider>
  );
}
