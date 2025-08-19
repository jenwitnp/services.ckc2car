import crypto from "crypto";

/**
 * Intelligent AI Response Cache
 * Caches AI responses to reduce expensive Gemini API calls
 */
export class AIResponseCache {
  constructor(config = {}) {
    this.cache = new Map();
    this.maxSize = config.maxSize || 1000;
    this.ttl = config.ttl || 30 * 60 * 1000; // 30 minutes default
    this.hitCount = 0;
    this.missCount = 0;
    this.startCleanupTimer();
  }

  /**
   * Generate cache key from user message and context
   */
  generateKey(userMessage, context = {}) {
    const normalizedMessage = userMessage.toLowerCase().trim();

    // Create hash from message + essential context
    const keyData = {
      message: normalizedMessage,
      platform: context.platform || "line",
      hasCarContext: !!(context.carModels?.length || context.branches?.length),
      userId: context.userId || "anonymous", // Include user for personalized responses
    };

    return crypto
      .createHash("md5")
      .update(JSON.stringify(keyData))
      .digest("hex");
  }

  /**
   * Get cached response if available and not expired
   */
  get(key) {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      this.hitCount++;
      console.log(`[AI Cache] Cache HIT for key: ${key.substring(0, 8)}...`);

      // Update access time for LRU-like behavior
      cached.lastAccessed = Date.now();
      return cached.response;
    }

    if (cached) {
      this.cache.delete(key); // Remove expired entry
    }

    this.missCount++;
    console.log(`[AI Cache] Cache MISS for key: ${key.substring(0, 8)}...`);
    return null;
  }

  /**
   * Store response in cache
   */
  set(key, response) {
    // Don't cache error responses
    if (response.type === "error" || !response) {
      return;
    }

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      response: JSON.parse(JSON.stringify(response)), // Deep clone
      timestamp: Date.now(),
      lastAccessed: Date.now(),
    });

    console.log(
      `[AI Cache] Cached response for key: ${key.substring(0, 8)}...`
    );
  }

  /**
   * Remove oldest entries when cache is full
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(
        `[AI Cache] Evicted oldest entry: ${oldestKey.substring(0, 8)}...`
      );
    }
  }

  /**
   * Clear cache for specific user (useful for testing)
   */
  clearUser(userId) {
    let cleared = 0;
    for (const [key, value] of this.cache.entries()) {
      if (key.includes(userId)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    console.log(`[AI Cache] Cleared ${cleared} entries for user: ${userId}`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? ((this.hitCount / total) * 100).toFixed(2) : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: `${hitRate}%`,
      ttl: this.ttl,
    };
  }

  /**
   * Cleanup expired entries periodically
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[AI Cache] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    console.log(`[AI Cache] Cleared all ${size} entries`);
  }

  /**
   * Check if a response should be cached based on content
   */
  shouldCache(response, userMessage) {
    // Don't cache very short or generic responses
    if (
      response.type === "text" &&
      response.text &&
      response.text.length < 20
    ) {
      return false;
    }

    // Don't cache responses with user-specific data (like appointment details)
    const userSpecificKeywords = [
      "นัดหมาย",
      "ลูกค้า",
      "appointment",
      "booking",
    ];
    const containsUserSpecific = userSpecificKeywords.some(
      (keyword) =>
        userMessage.toLowerCase().includes(keyword) ||
        (response.text && response.text.toLowerCase().includes(keyword))
    );

    if (containsUserSpecific) {
      return false;
    }

    // Cache car search results and general information
    return true;
  }
}

// Global cache instance
export const aiResponseCache = new AIResponseCache({
  maxSize: 1000,
  ttl: 30 * 60 * 1000, // 30 minutes
});

// Export cache stats function for monitoring
export function getAICacheStats() {
  return aiResponseCache.getStats();
}
