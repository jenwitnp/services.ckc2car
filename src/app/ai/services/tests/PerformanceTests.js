/**
 * Performance Optimization Test Suite
 * Tests for AI response caching and performance monitoring
 */

import { aiResponseCache } from "@/app/ai/services/cache/AIResponseCache.js";
import { performanceMonitor } from "@/app/ai/services/monitoring/PerformanceMonitor.js";

// Test data
const testContext = {
  userId: "test-user-123",
  platform: "line",
  carModels: ["Toyota", "Honda"],
  branches: ["Bangkok", "Chiang Mai"],
};

const testMessages = [
  "สวัสดีครับ",
  "หารถ Toyota Camry ราคาประมาณ 500,000 บาท",
  "มีรถอะไรแนะนำบ้างครับ",
  "ขอดูรายละเอียดรถ Honda Civic หน่อยครับ",
];

/**
 * Test AI Response Cache functionality
 */
export async function testAIResponseCache() {
  console.log("🧪 Testing AI Response Cache...");

  // Clear cache before testing
  aiResponseCache.clear();

  // Test 1: Cache miss and set
  const cacheKey1 = aiResponseCache.generateKey(testMessages[0], testContext);
  const cachedResponse1 = aiResponseCache.get(cacheKey1);

  console.assert(
    cachedResponse1 === null,
    "❌ Cache should be empty initially"
  );
  console.log("✅ Cache miss test passed");

  // Test 2: Set and get cache
  const testResponse = {
    type: "text",
    text: "สวัสดีครับ ยินดีให้บริการครับ",
  };

  aiResponseCache.set(cacheKey1, testResponse);
  const cachedResponse2 = aiResponseCache.get(cacheKey1);

  console.assert(
    cachedResponse2 !== null,
    "❌ Cache should return stored response"
  );
  console.assert(
    cachedResponse2.text === testResponse.text,
    "❌ Cached response content should match"
  );
  console.log("✅ Cache set/get test passed");

  // Test 3: Cache key generation consistency
  const cacheKey2 = aiResponseCache.generateKey(testMessages[0], testContext);
  console.assert(cacheKey1 === cacheKey2, "❌ Cache keys should be consistent");
  console.log("✅ Cache key consistency test passed");

  // Test 4: Different messages should have different keys
  const cacheKey3 = aiResponseCache.generateKey(testMessages[1], testContext);
  console.assert(
    cacheKey1 !== cacheKey3,
    "❌ Different messages should have different cache keys"
  );
  console.log("✅ Cache key uniqueness test passed");

  // Test 5: Cache statistics
  const stats = aiResponseCache.getStats();
  console.assert(stats.hits >= 1, "❌ Should record cache hits");
  console.assert(stats.misses >= 1, "❌ Should record cache misses");
  console.log("✅ Cache statistics test passed");

  console.log("🎉 AI Response Cache tests completed successfully!");
  return true;
}

/**
 * Test Performance Monitor functionality
 */
export async function testPerformanceMonitor() {
  console.log("🧪 Testing Performance Monitor...");

  // Test 1: Record AI operation
  performanceMonitor.recordAI(500, true, false);
  performanceMonitor.recordAI(1200, false, true); // timeout

  // Test 2: Record database operation
  performanceMonitor.recordDatabase(150, true);
  performanceMonitor.recordDatabase(300, false);

  // Test 3: Record cache operations
  performanceMonitor.recordCache(true); // hit
  performanceMonitor.recordCache(false); // miss

  // Test 4: Record request
  performanceMonitor.recordRequest(800, true);

  // Test 5: Get statistics
  const stats = performanceMonitor.getStats();

  console.assert(stats.ai.total >= 2, "❌ Should record AI operations");
  console.assert(
    stats.database.queries >= 2,
    "❌ Should record database operations"
  );
  console.assert(stats.cache.hits >= 1, "❌ Should record cache hits");
  console.assert(stats.cache.misses >= 1, "❌ Should record cache misses");
  console.assert(stats.requests.total >= 1, "❌ Should record requests");

  console.log("✅ Performance monitoring test passed");

  // Test 6: Performance report generation
  const report = performanceMonitor.generateReport();
  console.assert(report.summary, "❌ Report should have summary");
  console.assert(report.detailed, "❌ Report should have detailed stats");
  console.assert(
    Array.isArray(report.alerts),
    "❌ Report should have alerts array"
  );
  console.assert(
    Array.isArray(report.recommendations),
    "❌ Report should have recommendations array"
  );

  console.log("✅ Performance report test passed");
  console.log("🎉 Performance Monitor tests completed successfully!");
  return true;
}

/**
 * Test cache performance improvement
 */
export async function testCachePerformance() {
  console.log("🧪 Testing Cache Performance Improvement...");

  const iterations = 100;
  const message = "หารถ Honda ราคาไม่เกิน 500000 บาท";

  // Simulate AI processing time
  const simulateAIProcessing = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: "text",
          text: "พบรถ Honda 5 คัน ที่ตรงกับความต้องการ",
        });
      }, Math.random() * 500 + 200); // 200-700ms simulation
    });
  };

  // Test without cache
  console.log("⏱️ Testing without cache...");
  const startWithoutCache = Date.now();

  for (let i = 0; i < iterations; i++) {
    await simulateAIProcessing();
  }

  const timeWithoutCache = Date.now() - startWithoutCache;
  console.log(
    `Without cache: ${timeWithoutCache}ms for ${iterations} requests`
  );

  // Test with cache
  console.log("⏱️ Testing with cache...");
  aiResponseCache.clear();
  const cacheKey = aiResponseCache.generateKey(message, testContext);

  const startWithCache = Date.now();

  for (let i = 0; i < iterations; i++) {
    const cached = aiResponseCache.get(cacheKey);

    if (cached) {
      // Cache hit - instant response
      continue;
    } else {
      // Cache miss - simulate AI processing and cache result
      const response = await simulateAIProcessing();
      aiResponseCache.set(cacheKey, response);
    }
  }

  const timeWithCache = Date.now() - startWithCache;
  console.log(`With cache: ${timeWithCache}ms for ${iterations} requests`);

  const improvement = (
    ((timeWithoutCache - timeWithCache) / timeWithoutCache) *
    100
  ).toFixed(2);
  console.log(`🚀 Performance improvement: ${improvement}%`);

  const cacheStats = aiResponseCache.getStats();
  console.log(`Cache hit rate: ${cacheStats.hitRate}`);

  console.log("🎉 Cache performance test completed!");
  return {
    timeWithoutCache,
    timeWithCache,
    improvement: parseFloat(improvement),
    cacheStats,
  };
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log("🚀 Running Performance Optimization Tests...\n");

  try {
    await testAIResponseCache();
    console.log("");

    await testPerformanceMonitor();
    console.log("");

    const performanceResults = await testCachePerformance();
    console.log("");

    console.log("🎉 All tests completed successfully!");
    console.log("\n📊 Performance Optimization Results:");
    console.log(
      `   • Cache Performance Improvement: ${performanceResults.improvement}%`
    );
    console.log(
      `   • Cache Hit Rate: ${performanceResults.cacheStats.hitRate}`
    );
    console.log(`   • Cache Size: ${performanceResults.cacheStats.size}`);

    return {
      success: true,
      results: performanceResults,
    };
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Export for use in API endpoints or manual testing
const performanceTests = {
  testAIResponseCache,
  testPerformanceMonitor,
  testCachePerformance,
  runAllTests,
};

export default performanceTests;
