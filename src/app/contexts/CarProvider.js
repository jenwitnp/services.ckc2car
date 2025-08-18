"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const CarContext = createContext();

export const CarProvider = ({ children }) => {
  // Car search and AI state management
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState(null);

  // AI Auto-reply settings for LINE OA
  const [aiSettings, setAiSettings] = useState({
    enabled: false,
    responseTemplate:
      "สวัสดีค่ะ ขอบคุณสำหรับข้อความ เจ้าหน้าที่จะติดต่อกลับในเร็วๆ นี้ค่ะ",
    carSearchEnabled: true,
    maxResponseLength: 1000,
    greetingMessages: true,
    businessHours: {
      enabled: false,
      start: "09:00",
      end: "18:00",
      timezone: "Asia/Bangkok",
    },
  });

  // LINE integration state
  const [lineUsers, setLineUsers] = useState([]);
  const [activeConversations, setActiveConversations] = useState(new Map());

  // Car data cache
  const [carModels, setCarModels] = useState([]);
  const [carBrands, setCarBrands] = useState([]);
  const [carTypes, setCarTypes] = useState([]);
  const [branches, setBranches] = useState([]);

  // Load AI settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("lineAiSettings");
    if (savedSettings) {
      try {
        setAiSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Error loading AI settings:", error);
      }
    }
  }, []);

  // Save AI settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem("lineAiSettings", JSON.stringify(aiSettings));
  }, [aiSettings]);

  // Car search function
  const searchCars = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cars/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(query),
      });

      if (!response.ok) {
        throw new Error("Failed to search cars");
      }

      const data = await response.json();
      setSearchResults(data.cars || []);
      setLastQuery(query);
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Car search error:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Clear search results
  const clearSearch = () => {
    setSearchResults([]);
    setLastQuery(null);
    setError(null);
  };

  // AI Settings management
  const updateAiSettings = (newSettings) => {
    setAiSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const toggleAiAutoReply = (enabled) => {
    setAiSettings((prev) => ({
      ...prev,
      enabled: enabled !== undefined ? enabled : !prev.enabled,
    }));
  };

  // LINE user management
  const addLineUser = (user) => {
    setLineUsers((prev) => {
      const existingIndex = prev.findIndex((u) => u.userId === user.userId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...user };
        return updated;
      }
      return [...prev, user];
    });
  };

  const updateLineUser = (userId, updates) => {
    setLineUsers((prev) =>
      prev.map((user) =>
        user.userId === userId ? { ...user, ...updates } : user
      )
    );
  };

  // Active conversation management
  const setActiveConversation = (userId, conversationData) => {
    setActiveConversations((prev) => {
      const updated = new Map(prev);
      updated.set(userId, {
        ...conversationData,
        lastActivity: new Date().toISOString(),
      });
      return updated;
    });
  };

  const removeActiveConversation = (userId) => {
    setActiveConversations((prev) => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });
  };

  const getActiveConversation = (userId) => {
    return activeConversations.get(userId);
  };

  // Business hours check
  const isBusinessHours = () => {
    if (!aiSettings.businessHours.enabled) {
      return true; // Always available if business hours not enabled
    }

    const now = new Date();
    const currentTime = now
      .toLocaleTimeString("en-GB", {
        hour12: false,
        timeZone: aiSettings.businessHours.timezone,
      })
      .substring(0, 5);

    const start = aiSettings.businessHours.start;
    const end = aiSettings.businessHours.end;

    return currentTime >= start && currentTime <= end;
  };

  // Format car data for LINE messages
  const formatCarForLine = (car) => {
    return `🚗 ${car.ยี่ห้อ} ${car.รุ่น}
💰 ราคา: ${car.ราคา}
📍 สาขา: ${car.สาขา}
🎨 สี: ${car.สี}
⚙️ เกียร์: ${car.เกียร์}
🔖 รหัสรถ: ${car.รหัสรถ}`;
  };

  const value = {
    // Car search state
    searchResults,
    loading,
    error,
    lastQuery,

    // Car search functions
    searchCars,
    clearSearch,

    // AI settings
    aiSettings,
    updateAiSettings,
    toggleAiAutoReply,
    isBusinessHours,

    // LINE integration
    lineUsers,
    addLineUser,
    updateLineUser,

    // Active conversations
    activeConversations,
    setActiveConversation,
    removeActiveConversation,
    getActiveConversation,

    // Car data cache
    carModels,
    setCarModels,
    carBrands,
    setCarBrands,
    carTypes,
    setCarTypes,
    branches,
    setBranches,

    // Utility functions
    formatCarForLine,
  };

  return <CarContext.Provider value={value}>{children}</CarContext.Provider>;
};

export const useCarContext = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error("useCarContext must be used within a CarProvider");
  }
  return context;
};

export default CarProvider;
