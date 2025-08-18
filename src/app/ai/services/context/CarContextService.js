import { cache } from "react";
import { apiFactory } from "@/app/services/api/ApiFactory.js";

export class CarContextService {
  /**
   * Get cached reference data for AI context
   * This is a wrapper around the centralized cars API
   */
  getCachedReferenceData = cache(async () => {
    console.log("[CarContextService] Fetching reference data");

    try {
      const result = await apiFactory.cars.getReferenceData({
        format: "detailed",
        include: "models,branches,types",
      });

      if (result.success) {
        const data = {
          carModels: result.carModels,
          branches: result.branches,
          carTypes: result.carTypes,
          lastUpdated:
            result.data?.metadata?.lastUpdated || new Date().toISOString(),
        };

        console.log(
          `[CarContextService] Loaded: ${data.carModels.length} models, ${data.branches.length} branches, ${data.carTypes.length} types`
        );

        return data;
      }

      throw new Error(result.error || "Failed to fetch reference data");
    } catch (error) {
      console.error("[CarContextService] Error:", error);
      return this.createFallbackData(error.message);
    }
  });

  /**
   * Create fallback data when API fails
   */
  createFallbackData(errorMessage = "Unknown error") {
    return {
      carModels: [],
      branches: [],
      carTypes: [],
      lastUpdated: new Date().toISOString(),
      error: errorMessage,
      fallback: true,
    };
  }

  /**
   * Get user context with additional LINE-specific data
   */
  async getUserContext(userId, platform = "web") {
    try {
      const referenceData = await this.getCachedReferenceData();

      return {
        ...referenceData,
        userId,
        platform,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[CarContextService] Error getting user context:", error);
      return this.createFallbackData(error.message);
    }
  }
}

// Export singleton instance
export const carContextService = new CarContextService();
