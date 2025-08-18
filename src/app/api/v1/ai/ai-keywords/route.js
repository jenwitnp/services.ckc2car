import { NextResponse } from "next/server";
import { keywordManager } from "@/app/ai/services/management/KeywordManagementService.js";

// # Simple keyword operations
// GET /api/v1/ai/ai-keyword/keywords?action=list
// POST /api/v1/ai/ai-keyword/keywords {"action": "add", "category": "business", "keywords": ["rent"]}

// # Advanced operations
// GET /api/v1/ai/ai-keyword/keywords?action=search&search=ซื้อ&category=business
// POST /api/v1/ai/ai-keyword/keywords {"action": "test", "testTexts": ["ผมอยากซื้อรถ", "สวัสดีครับ"]}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    switch (action) {
      case "list":
        return NextResponse.json({
          success: true,
          data: keywordManager.getDetailedStats(),
        });

      case "search":
        if (!search) {
          return NextResponse.json(
            {
              success: false,
              error: "Search term required",
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: keywordManager.searchKeywords(search, { category }),
        });

      case "analytics":
        return NextResponse.json({
          success: true,
          data: keywordManager.getAnalytics(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, ...data } = await request.json();

    switch (action) {
      case "add":
        const added = keywordManager.keywordService.addKeywords(
          data.category,
          data.keywords
        );
        return NextResponse.json({
          success: true,
          message: `Added ${added.length} keywords`,
          data: { added },
        });

      case "bulk_add":
        const bulkResult = keywordManager.bulkAddKeywords(data.operations);
        return NextResponse.json({
          success: true,
          data: bulkResult,
        });

      case "create_category":
        const category = keywordManager.createCategoryAdvanced(
          data.name,
          data.keywords,
          data.options
        );
        return NextResponse.json({
          success: true,
          message: `Category ${data.name} created`,
          data: category,
        });

      case "test":
        const testResults = keywordManager.testKeywords(data.testTexts);
        return NextResponse.json({
          success: true,
          data: testResults,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Unknown action",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { category, keywords } = await request.json();

    const removed = keywordManager.keywordService.removeKeywords(
      category,
      keywords
    );

    return NextResponse.json({
      success: true,
      message: `Removed ${removed} keywords from ${category}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
