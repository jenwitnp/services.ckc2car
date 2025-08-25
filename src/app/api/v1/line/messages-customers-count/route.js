import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchData } from "@/app/services/supabase/query";
import { AIProcessor } from "@/app/ai/core/processor";

// ✅ Simple in-memory cache for testing
const tempCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ✅ Simple cache functions
function getCacheKey(timeRange, includeSummary, messageCount) {
  return `analytics:${timeRange}:${includeSummary}:${messageCount}`;
}

function getFromCache(key) {
  const cached = tempCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    tempCache.delete(key);
    return null;
  }

  console.log(`[TempCache] Cache HIT for key: ${key}`);
  return cached.data;
}

function setCache(key, data) {
  tempCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
    createdAt: Date.now(),
  });
  console.log(`[TempCache] Cached data for key: ${key}`);
}

function clearCache() {
  const size = tempCache.size;
  tempCache.clear();
  console.log(`[TempCache] Cleared ${size} cache entries`);
  return size;
}

export async function GET(request) {
  try {
    // ✅ Authentication check
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const timeRange = parseInt(searchParams.get("timeRange") || "30"); // days
    const includeSummary = searchParams.get("includeSummary") === "true";
    const forceRefresh = searchParams.get("forceRefresh") === "true";

    console.log(
      `[Analytics API] Request - timeRange: ${timeRange}d, includeSummary: ${includeSummary}, forceRefresh: ${forceRefresh}`
    );

    // ✅ Calculate date range
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);
    const startDateISO = startDate.toISOString();

    console.log(
      `[Analytics API] Analyzing data from ${startDateISO} to ${endDate}`
    );

    // ✅ Fetch basic analytics data
    const [customerStats, messageStats, conversationData] = await Promise.all([
      getCustomerStats(startDateISO),
      getMessageStats(startDateISO),
      getConversationData(startDateISO, timeRange),
    ]);

    // ✅ Generate cache key based on data
    const cacheKey = getCacheKey(
      timeRange,
      includeSummary,
      conversationData.totalUserMessages
    );

    let response = {
      timeRange: timeRange,
      period: {
        startDate: startDateISO,
        endDate: endDate,
        days: timeRange,
      },
      customers: customerStats,
      messages: messageStats,
      conversations: {
        ...conversationData,
        rawMessages: undefined, // Remove from response
      },
      generatedAt: new Date().toISOString(),
      fromCache: false,
    };

    // ✅ Add AI analysis if requested
    if (includeSummary && conversationData.rawMessages.length > 0) {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedAI = getFromCache(cacheKey);
        if (cachedAI) {
          response.aiAnalysis = {
            ...cachedAI,
            fromCache: true,
            lastGenerated: cachedAI.analysisGeneratedAt,
          };
          console.log("[Analytics API] Using cached AI analysis");
          return NextResponse.json(response);
        }
      }

      console.log("[Analytics API] Generating AI analysis...");
      const aiProcessor = new AIProcessor();

      try {
        const [provinceAnalysis, carInterestAnalysis, insightsSummary] =
          await Promise.all([
            aiProcessor.analyzeCustomerProvinces(conversationData.rawMessages),
            aiProcessor.analyzeCarInterests(conversationData.rawMessages),
            aiProcessor.generateBusinessInsights({
              customers: customerStats,
              messages: messageStats,
              conversations: conversationData,
              timeRange: timeRange,
            }),
          ]);

        const aiAnalysis = {
          provinces: provinceAnalysis,
          carInterests: carInterestAnalysis,
          insights: insightsSummary,
          analysisGeneratedAt: new Date().toISOString(),
          fromCache: false,
        };

        response.aiAnalysis = aiAnalysis;

        // ✅ Cache the AI analysis
        setCache(cacheKey, aiAnalysis);
      } catch (aiError) {
        console.error("[Analytics API] AI analysis error:", aiError);
        response.aiAnalysis = {
          error: `AI analysis failed: ${aiError.message}`,
          analysisGeneratedAt: new Date().toISOString(),
          fromCache: false,
        };
      }
    }

    console.log("[Analytics API] Data generated successfully");
    return NextResponse.json(response);
  } catch (error) {
    console.error("[Analytics API] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ✅ Add POST method for cache management
export async function POST(request) {
  try {
    const { action } = await request.json();

    if (action === "clearCache") {
      const cleared = clearCache();
      return NextResponse.json({
        message: `Cleared ${cleared} cache entries`,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "getCacheStats") {
      const stats = {
        totalEntries: tempCache.size,
        entries: Array.from(tempCache.keys()).map((key) => {
          const entry = tempCache.get(key);
          return {
            key,
            createdAt: new Date(entry.createdAt).toISOString(),
            expiresAt: new Date(entry.expiresAt).toISOString(),
            isExpired: Date.now() > entry.expiresAt,
          };
        }),
      };
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Analytics API] POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// ✅ Helper Functions (unchanged)

async function getCustomerStats(startDate) {
  try {
    // Get all conversations to analyze unique customers
    const allConversations = await fetchData("line_admin_conversations", {
      select: "line_user_id, line_username, created_at",
      gte: { created_at: startDate },
    });

    if (!allConversations.success) {
      throw new Error("Failed to fetch conversations");
    }

    // Calculate unique customers and growth
    const uniqueCustomers = new Set();
    const newCustomers = new Set();
    const customersWithUsername = new Set();

    allConversations.data.forEach((conv) => {
      if (conv.line_user_id) {
        uniqueCustomers.add(conv.line_user_id);

        if (conv.created_at >= startDate) {
          newCustomers.add(conv.line_user_id);
        }

        if (conv.line_username) {
          customersWithUsername.add(conv.line_username);
        }
      }
    });

    return {
      totalUniqueCustomers: uniqueCustomers.size,
      newCustomers: newCustomers.size,
      customersWithUsername: customersWithUsername.size,
      dataPoints: allConversations.data.length,
    };
  } catch (error) {
    console.error("[Analytics] Customer stats error:", error);
    return {
      totalUniqueCustomers: 0,
      newCustomers: 0,
      customersWithUsername: 0,
      error: error.message,
    };
  }
}

async function getMessageStats(startDate) {
  try {
    // ✅ Get recent conversations - using only existing fields
    const recentConversations = await fetchData("line_admin_conversations", {
      select:
        "id, line_user_id, line_username, message_role, message_content, message_type, admin_id, admin_name, platform, created_at, updated_at",
      gte: { created_at: startDate },
      sort: ["created_at", "desc"],
    });

    if (!recentConversations.success) {
      throw new Error("Failed to fetch recent conversations");
    }

    let totalMessages = 0;
    let userMessages = 0;
    let botResponses = 0;
    let adminMessages = 0;
    let textMessages = 0;
    let mediaMessages = 0;
    let totalMessageLength = 0;

    const activeUsers = new Set();
    const activeAdmins = new Set();

    recentConversations.data.forEach((conv) => {
      if (conv.line_user_id) {
        activeUsers.add(conv.line_user_id);
      }

      if (conv.admin_id) {
        activeAdmins.add(conv.admin_id);
      }

      // ✅ Count messages directly from table structure
      totalMessages++;

      // Count by role
      if (conv.message_role === "user") {
        userMessages++;
      } else if (conv.message_role === "assistant") {
        botResponses++;
      } else if (conv.message_role === "admin") {
        adminMessages++;
      }

      // Count by message type
      if (conv.message_type === "text") {
        textMessages++;
      } else {
        mediaMessages++;
      }

      // Calculate message length
      if (conv.message_content && typeof conv.message_content === "string") {
        totalMessageLength += conv.message_content.length;
      }
    });

    return {
      totalMessages,
      userMessages,
      botResponses,
      adminMessages,
      textMessages,
      mediaMessages,
      activeUsers: activeUsers.size,
      activeAdmins: activeAdmins.size,
      avgMessageLength:
        totalMessages > 0 ? Math.round(totalMessageLength / totalMessages) : 0,
      recentConversations: recentConversations.data.length,
    };
  } catch (error) {
    console.error("[Analytics] Message stats error:", error);
    return {
      totalMessages: 0,
      userMessages: 0,
      botResponses: 0,
      activeUsers: 0,
      error: error.message,
    };
  }
}

async function getConversationData(startDate, timeRange) {
  try {
    // ✅ Get conversations with content for AI analysis - using only existing fields
    const conversations = await fetchData("line_admin_conversations", {
      select:
        "id, line_user_id, line_username, message_role, message_content, message_type, metadata, platform, created_at, updated_at",
      gte: { created_at: startDate },
      sort: ["updated_at", "desc"],
      limit: 1000, // Limit for performance
    });

    if (!conversations.success) {
      throw new Error("Failed to fetch conversation data");
    }

    // ✅ Extract messages for AI analysis - treat each row as a message
    const rawMessages = [];
    const conversationSummaries = [];

    conversations.data.forEach((conv) => {
      // ✅ Each row is a message, collect user messages for AI analysis
      if (conv.message_role === "user" && conv.message_content) {
        rawMessages.push({
          userId: conv.line_user_id,
          username: conv.line_username,
          content: conv.message_content, // Direct text content, not JSON
          timestamp: conv.created_at,
          conversationId: conv.id,
          messageType: conv.message_type,
          platform: conv.platform,
        });
      }

      // ✅ Check metadata for summaries (if they exist in metadata field)
      if (conv.metadata) {
        try {
          const metadata =
            typeof conv.metadata === "string"
              ? JSON.parse(conv.metadata)
              : conv.metadata;

          if (metadata.summary) {
            conversationSummaries.push({
              conversationId: conv.id,
              userId: conv.line_user_id,
              summary: metadata.summary,
              createdAt: conv.created_at,
            });
          }
        } catch (parseError) {
          // Ignore metadata parsing errors
        }
      }
    });

    // ✅ Group conversations by user to get unique conversation count
    const uniqueConversations = new Set();
    const platformBreakdown = {};

    conversations.data.forEach((conv) => {
      if (conv.line_user_id) {
        uniqueConversations.add(conv.line_user_id);
      }

      // Count by platform
      const platform = conv.platform || "unknown";
      platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
    });

    return {
      totalConversations: uniqueConversations.size, // Unique conversations by user
      totalMessages: conversations.data.length, // Total message rows
      conversationsWithSummary: conversationSummaries.length,
      totalUserMessages: rawMessages.length,
      platformBreakdown: platformBreakdown,
      rawMessages: rawMessages, // For AI analysis
      summaries: conversationSummaries,
      timeRange: timeRange,
    };
  } catch (error) {
    console.error("[Analytics] Conversation data error:", error);
    return {
      totalConversations: 0,
      conversationsWithSummary: 0,
      totalUserMessages: 0,
      rawMessages: [],
      error: error.message,
    };
  }
}
