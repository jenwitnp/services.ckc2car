/**
 * Performance Monitor for LINE Bot AI System
 * Tracks response times, cache hits, and expensive operations
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      aiCalls: {
        total: 0,
        totalTime: 0,
        timeouts: 0,
        errors: 0,
      },
      database: {
        queries: 0,
        totalTime: 0,
        errors: 0,
      },
      cache: {
        hits: 0,
        misses: 0,
      },
      requests: {
        total: 0,
        totalTime: 0,
        errors: 0,
      },
    };
    this.startTime = Date.now();
  }

  /**
   * Start timing an operation
   */
  startTimer(operation) {
    return {
      operation,
      startTime: Date.now(),
      end: () => {
        const duration = Date.now() - Date.now();
        this.recordMetric(operation, duration);
        return duration;
      },
    };
  }

  /**
   * Record a metric with timing
   */
  recordMetric(operation, duration, success = true) {
    const category = this.getCategory(operation);

    if (this.metrics[category]) {
      this.metrics[category].total++;
      this.metrics[category].totalTime += duration;

      if (!success) {
        this.metrics[category].errors++;
      }

      // Log slow operations
      if (duration > 1000) {
        console.warn(`[Performance] Slow ${operation}: ${duration}ms`);
      }
    }
  }

  /**
   * Record AI operation
   */
  recordAI(duration, success = true, timeout = false) {
    this.metrics.aiCalls.total++;
    this.metrics.aiCalls.totalTime += duration;

    if (timeout) {
      this.metrics.aiCalls.timeouts++;
    }

    if (!success) {
      this.metrics.aiCalls.errors++;
    }
  }

  /**
   * Record database operation
   */
  recordDatabase(duration, success = true) {
    this.metrics.database.queries++;
    this.metrics.database.totalTime += duration;

    if (!success) {
      this.metrics.database.errors++;
    }
  }

  /**
   * Record cache hit/miss
   */
  recordCache(hit = true) {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }
  }

  /**
   * Record request
   */
  recordRequest(duration, success = true) {
    this.metrics.requests.total++;
    this.metrics.requests.totalTime += duration;

    if (!success) {
      this.metrics.requests.errors++;
    }
  }

  /**
   * Get category for operation
   */
  getCategory(operation) {
    if (operation.includes("ai") || operation.includes("gemini")) {
      return "aiCalls";
    }
    if (operation.includes("db") || operation.includes("database")) {
      return "database";
    }
    return "requests";
  }

  /**
   * Get performance statistics
   */
  getStats() {
    const uptime = Date.now() - this.startTime;
    const uptimeHours = (uptime / (1000 * 60 * 60)).toFixed(2);

    return {
      uptime: `${uptimeHours} hours`,
      ai: {
        ...this.metrics.aiCalls,
        averageTime:
          this.metrics.aiCalls.total > 0
            ? Math.round(
                this.metrics.aiCalls.totalTime / this.metrics.aiCalls.total
              )
            : 0,
        timeoutRate:
          this.metrics.aiCalls.total > 0
            ? (
                (this.metrics.aiCalls.timeouts / this.metrics.aiCalls.total) *
                100
              ).toFixed(2) + "%"
            : "0%",
        errorRate:
          this.metrics.aiCalls.total > 0
            ? (
                (this.metrics.aiCalls.errors / this.metrics.aiCalls.total) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
      database: {
        ...this.metrics.database,
        averageTime:
          this.metrics.database.queries > 0
            ? Math.round(
                this.metrics.database.totalTime / this.metrics.database.queries
              )
            : 0,
        errorRate:
          this.metrics.database.queries > 0
            ? (
                (this.metrics.database.errors / this.metrics.database.queries) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
      cache: {
        ...this.metrics.cache,
        hitRate:
          this.metrics.cache.hits + this.metrics.cache.misses > 0
            ? (
                (this.metrics.cache.hits /
                  (this.metrics.cache.hits + this.metrics.cache.misses)) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
      requests: {
        ...this.metrics.requests,
        averageTime:
          this.metrics.requests.total > 0
            ? Math.round(
                this.metrics.requests.totalTime / this.metrics.requests.total
              )
            : 0,
        requestsPerHour:
          this.metrics.requests.total > 0 && uptime > 0
            ? Math.round(
                (this.metrics.requests.total / uptime) * (1000 * 60 * 60)
              )
            : 0,
        errorRate:
          this.metrics.requests.total > 0
            ? (
                (this.metrics.requests.errors / this.metrics.requests.total) *
                100
              ).toFixed(2) + "%"
            : "0%",
      },
    };
  }

  /**
   * Get performance alerts
   */
  getAlerts() {
    const stats = this.getStats();
    const alerts = [];

    // High response time alert
    if (stats.requests.averageTime > 2000) {
      alerts.push({
        type: "warning",
        message: `High average response time: ${stats.requests.averageTime}ms`,
        threshold: "2000ms",
      });
    }

    // High AI timeout rate
    if (parseFloat(stats.ai.timeoutRate) > 2) {
      alerts.push({
        type: "error",
        message: `High AI timeout rate: ${stats.ai.timeoutRate}`,
        threshold: "2%",
      });
    }

    // Low cache hit rate
    if (parseFloat(stats.cache.hitRate) < 30) {
      alerts.push({
        type: "info",
        message: `Low cache hit rate: ${stats.cache.hitRate}`,
        threshold: "30%",
      });
    }

    // High error rate
    if (parseFloat(stats.requests.errorRate) > 5) {
      alerts.push({
        type: "error",
        message: `High error rate: ${stats.requests.errorRate}`,
        threshold: "5%",
      });
    }

    return alerts;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = {
      aiCalls: { total: 0, totalTime: 0, timeouts: 0, errors: 0 },
      database: { queries: 0, totalTime: 0, errors: 0 },
      cache: { hits: 0, misses: 0 },
      requests: { total: 0, totalTime: 0, errors: 0 },
    };
    this.startTime = Date.now();
    console.log("[Performance] Metrics reset");
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const stats = this.getStats();
    const alerts = this.getAlerts();

    return {
      timestamp: new Date().toISOString(),
      summary: {
        uptime: stats.uptime,
        totalRequests: stats.requests.total,
        averageResponseTime: `${stats.requests.averageTime}ms`,
        cacheHitRate: stats.cache.hitRate,
        errorRate: stats.requests.errorRate,
      },
      detailed: stats,
      alerts,
      recommendations: this.generateRecommendations(stats, alerts),
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(stats, alerts) {
    const recommendations = [];

    if (parseFloat(stats.cache.hitRate) < 50) {
      recommendations.push(
        "Consider increasing cache TTL or improving cache key generation"
      );
    }

    if (stats.ai.averageTime > 800) {
      recommendations.push(
        "AI response time is high - consider implementing response streaming"
      );
    }

    if (stats.database.averageTime > 200) {
      recommendations.push(
        "Database queries are slow - review indexes and query optimization"
      );
    }

    if (parseFloat(stats.ai.timeoutRate) > 1) {
      recommendations.push(
        "High AI timeout rate - consider reducing timeout threshold or optimizing prompts"
      );
    }

    return recommendations;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to time async operations
export async function timeOperation(operation, asyncFn) {
  const startTime = Date.now();
  let success = true;
  let result;

  try {
    result = await asyncFn();
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    performanceMonitor.recordMetric(operation, duration, success);
  }

  return result;
}
