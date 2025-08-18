import { carContextService } from "./CarContextService.js";

export class ContextService {
  /**
   * Get user context for LINE users
   * Uses the centralized CarContextService
   */
  async getUserContext(userId, options = {}) {
    try {
      console.log(`[ContextService] Getting context for LINE user: ${userId}`);

      const platform = options.platform || "line";
      const includeMetadata = options.includeMetadata || false;

      const context = await carContextService.getUserContext(userId, platform, {
        includeMetadata,
      });

      if (context.fallback) {
        console.warn(
          "[ContextService] Using fallback context due to API error"
        );
      }

      // Add LINE-specific context data if needed
      if (platform === "line") {
        context.lineFeatures = {
          supportsFlex: true,
          supportsQuickReply: true,
          supportsRichMenu: true,
        };
      }

      return context;
    } catch (error) {
      console.error("[ContextService] Error:", error);
      return this.createFallbackContext(userId, options.platform);
    }
  }

  /**
   * Get context for multiple users (batch operation)
   */
  async getBatchUserContext(userIds, options = {}) {
    try {
      console.log(
        `[ContextService] Getting batch context for ${userIds.length} users`
      );

      const contexts = await Promise.allSettled(
        userIds.map((userId) => this.getUserContext(userId, options))
      );

      return contexts.map((result, index) => ({
        userId: userIds[index],
        context:
          result.status === "fulfilled"
            ? result.value
            : this.createFallbackContext(userIds[index], options.platform),
        success: result.status === "fulfilled",
      }));
    } catch (error) {
      console.error("[ContextService] Batch operation error:", error);
      return userIds.map((userId) => ({
        userId,
        context: this.createFallbackContext(userId, options.platform),
        success: false,
      }));
    }
  }

  /**
   * Refresh context cache for a specific user
   */
  async refreshUserContext(userId, platform = "line") {
    try {
      console.log(`[ContextService] Refreshing context for user: ${userId}`);

      // Force refresh by bypassing cache
      const context = await carContextService.getUserContext(userId, platform, {
        forceRefresh: true,
      });

      return context;
    } catch (error) {
      console.error("[ContextService] Error refreshing context:", error);
      return this.createFallbackContext(userId, platform);
    }
  }

  createFallbackContext(userId, platform = "line") {
    const baseContext = {
      carModels: [],
      branches: [],
      carTypes: [],
      userId,
      platform,
      fallback: true,
      timestamp: new Date().toISOString(),
    };

    // Add platform-specific fallback features
    if (platform === "line") {
      baseContext.lineFeatures = {
        supportsFlex: true,
        supportsQuickReply: true,
        supportsRichMenu: true,
      };
    }

    return baseContext;
  }
}

// Export singleton instance
export const contextService = new ContextService();
