import { NextResponse } from "next/server";
import { conversationDb } from "@/app/ai/services/conversations/ConversationDatabaseService.js";

// # Get database statistics
// GET /api/v1/ai/ai-conversation/database?action=stats&userId=U123

// # Search conversations
// GET /api/v1/ai/ai-conversation/database?action=search&search=ซื้อรถ&userId=U123

// # Manual cleanup
// POST /api/v1/ai/ai-conversation/database
// {"action": "cleanup"}

// # Update configuration
// POST /api/v1/ai/ai-conversation/database
// {"action": "update_config", "config": {"retentionDays": 14}}

// # Delete user data
// DELETE /api/v1/ai/ai-conversation/database
// {"userId": "U123", "beforeDate": "2025-01-01"}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");

    switch (action) {
      case "stats":
        const statsResult = await conversationDb.getConversationStats(userId);
        return NextResponse.json({
          success: statsResult.success,
          data: statsResult.stats,
          error: statsResult.error,
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

        const searchResult = await conversationDb.searchConversations(search, {
          userId,
        });
        return NextResponse.json({
          success: searchResult.success,
          data: searchResult.results,
          count: searchResult.count,
          error: searchResult.error,
        });

      case "status":
        return NextResponse.json({
          success: true,
          data: conversationDb.getServiceStatus(),
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
      case "cleanup":
        const cleanupResult = await conversationDb.cleanupOldConversations();
        return NextResponse.json({
          success: cleanupResult.success,
          message: `Cleaned up ${cleanupResult.deletedCount} records`,
          data: cleanupResult,
        });

      case "update_config":
        conversationDb.updateConfig(data.config);
        return NextResponse.json({
          success: true,
          message: "Configuration updated",
          data: conversationDb.getServiceStatus(),
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
    const { userId, beforeDate } = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId is required",
        },
        { status: 400 }
      );
    }

    const deleteResult = await conversationDb.deleteUserConversations(
      userId,
      beforeDate
    );

    return NextResponse.json({
      success: deleteResult.success,
      message: `Deleted ${deleteResult.deletedCount} conversations`,
      data: deleteResult,
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
