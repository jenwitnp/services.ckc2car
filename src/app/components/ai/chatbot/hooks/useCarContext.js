// filepath: /Users/jenwitnoppiboon/Documents/ckc_v5/src/app/components/ai/chatbot/hooks/useCarContext.js
import { useState, useCallback } from "react";
import { carContextService } from "@/app/ai/services/context/CarContextService.js";

export const useCarContext = (userId) => {
  const [carContext, setCarContext] = useState({
    carModels: [],
    branches: [],
    carTypes: [],
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  const loadCarContext = useCallback(async () => {
    try {
      setCarContext((prev) => ({ ...prev, isLoading: true, error: null }));

      console.log("[useCarContext] Loading car context via CarContextService");

      const contextData = await carContextService.getUserContext(
        userId || "anonymous",
        "web"
      );

      if (contextData.fallback) {
        console.warn("[useCarContext] Using fallback car context");
        setCarContext({
          carModels: [],
          branches: [],
          carTypes: [],
          lastUpdated: contextData.lastUpdated,
          isLoading: false,
          error: contextData.error || "Failed to load reference data",
        });
      } else {
        console.log("[useCarContext] Car context loaded successfully:", {
          carModels: contextData.carModels?.length || 0,
          branches: contextData.branches?.length || 0,
          carTypes: contextData.carTypes?.length || 0,
        });

        setCarContext({
          carModels: contextData.carModels || [],
          branches: contextData.branches || [],
          carTypes: contextData.carTypes || [],
          lastUpdated: contextData.lastUpdated,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("[useCarContext] Error loading car context:", error);
      setCarContext({
        carModels: [],
        branches: [],
        carTypes: [],
        lastUpdated: new Date().toISOString(),
        isLoading: false,
        error: error.message,
      });
    }
  }, [userId]);

  return { carContext, loadCarContext };
};
