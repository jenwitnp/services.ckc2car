import { NextResponse } from "next/server";
import performanceTests from "@/app/ai/services/tests/PerformanceTests.js";

/**
 * GET /api/v1/line/performance/test
 * Run performance optimization tests
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get("type") || "all";

    let results;

    switch (testType) {
      case "cache":
        results = await performanceTests.testAIResponseCache();
        break;

      case "monitor":
        results = await performanceTests.testPerformanceMonitor();
        break;

      case "performance":
        results = await performanceTests.testCachePerformance();
        break;

      case "all":
      default:
        results = await performanceTests.runAllTests();
        break;
    }

    return NextResponse.json({
      success: true,
      testType,
      results,
      timestamp: new Date().toISOString(),
      message: `Performance tests (${testType}) completed successfully`,
    });
  } catch (error) {
    console.error("[Performance Test API] Error running tests:", error);
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
