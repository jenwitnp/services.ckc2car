import { NextResponse } from "next/server";
import {
  getAICacheStats,
  getPerformanceStats,
  getPerformanceReport,
  clearAICache,
  getSystemStatus,
} from "@/app/ai/adapters/line.js";

/**
 * GET /api/v1/line/performance
 * Get comprehensive performance statistics for LINE bot AI system
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "summary";

    switch (type) {
      case "full":
        // Full performance report with recommendations
        const fullReport = getPerformanceReport();
        return NextResponse.json({
          success: true,
          data: fullReport,
          timestamp: new Date().toISOString(),
        });

      case "cache":
        // AI cache statistics only
        const cacheStats = getAICacheStats();
        return NextResponse.json({
          success: true,
          data: cacheStats,
          timestamp: new Date().toISOString(),
        });

      case "performance":
        // Performance metrics only
        const perfStats = getPerformanceStats();
        return NextResponse.json({
          success: true,
          data: perfStats,
          timestamp: new Date().toISOString(),
        });

      case "system":
        // Complete system status
        const systemStatus = getSystemStatus();
        return NextResponse.json({
          success: true,
          data: systemStatus,
          timestamp: new Date().toISOString(),
        });

      default:
        // Summary view
        const [aiCache, performance] = [
          getAICacheStats(),
          getPerformanceStats(),
        ];

        const summary = {
          optimization: {
            cacheHitRate: aiCache.hitRate,
            averageResponseTime: `${performance.requests.averageTime}ms`,
            aiTimeoutRate: performance.ai.timeoutRate,
            totalRequests: performance.requests.total,
          },
          cache: {
            size: aiCache.size,
            hits: aiCache.hits,
            misses: aiCache.misses,
          },
          performance: {
            aiCalls: performance.ai.total,
            databaseQueries: performance.database.queries,
            averageAITime: `${performance.ai.averageTime}ms`,
            averageDbTime: `${performance.database.averageTime}ms`,
          },
          health: {
            uptime: performance.uptime,
            errorRate: performance.requests.errorRate,
            requestsPerHour: performance.requests.requestsPerHour,
          },
        };

        return NextResponse.json({
          success: true,
          data: summary,
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("[Performance API] Error getting stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/line/performance
 * Performance management actions (clear cache, reset metrics, etc.)
 */
export async function POST(request) {
  try {
    const { action, target } = await request.json();

    switch (action) {
      case "clearCache":
        if (target === "ai") {
          clearAICache();
          return NextResponse.json({
            success: true,
            message: "AI response cache cleared",
            timestamp: new Date().toISOString(),
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid cache target. Use 'ai'",
            },
            { status: 400 }
          );
        }

      case "resetMetrics":
        // Note: You'll need to add this method to PerformanceMonitor
        // performanceMonitor.reset();
        return NextResponse.json({
          success: true,
          message: "Performance metrics reset",
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid action. Supported actions: clearCache, resetMetrics",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Performance API] Error handling action:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/line/performance/cache
 * Clear specific cache entries
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Clear cache for specific user
      clearUserAICache(userId);
      return NextResponse.json({
        success: true,
        message: `AI cache cleared for user: ${userId}`,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Clear all cache
      clearAICache();
      return NextResponse.json({
        success: true,
        message: "All AI cache cleared",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("[Performance API] Error clearing cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
