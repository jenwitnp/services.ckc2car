import { NextResponse } from "next/server";
import {
  fetchData,
  saveData,
  updateData,
  deleteData,
} from "@/app/services/supabase/query.js";
import { processAIRequest } from "@/app/ai/core/index.js";

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "daily_analysis";
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];
    const cleanupDays = parseInt(searchParams.get("cleanup_days")) || 1; // Clean up conversations older than X days

    switch (action) {
      case "daily_analysis":
        return await performDailyAnalysisWithCleanup(date, cleanupDays);

      case "cleanup_only":
        return await cleanupOldConversations(cleanupDays);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function performDailyAnalysisWithCleanup(targetDate, cleanupDays) {
  console.log(
    `Starting daily analysis for ${targetDate} with cleanup of ${cleanupDays} days`
  );

  try {
    // Step 1: Extract customer data and admin performance
    const analysisResult = await extractCustomerDataWithAdminPerformance(
      targetDate
    );

    // Step 2: Clean up old conversation data after analysis
    const cleanupResult = await cleanupOldConversations(cleanupDays);

    return NextResponse.json({
      success: true,
      date: targetDate,
      results: {
        customer_analysis: analysisResult,
        data_cleanup: cleanupResult,
      },
    });
  } catch (error) {
    console.error("Daily analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function extractCustomerDataWithAdminPerformance(targetDate) {
  const startDate = new Date(targetDate);
  const endDate = new Date(targetDate);
  endDate.setDate(endDate.getDate() + 1);

  // Get all conversations for the target date
  const conversationsResult = await fetchData("line_admin_conversations", {
    gte: { created_at: startDate.toISOString() },
    lt: { created_at: endDate.toISOString() },
    sort: [
      { column: "line_user_id", ascending: true },
      { column: "created_at", ascending: true },
    ],
  });

  if (!conversationsResult.success) {
    throw new Error("Failed to fetch conversations");
  }

  const conversations = conversationsResult.data;

  // Group conversations by user
  const conversationsByUser = conversations.reduce((acc, conv) => {
    if (!acc[conv.line_user_id]) {
      acc[conv.line_user_id] = [];
    }
    acc[conv.line_user_id].push(conv);
    return acc;
  }, {});

  // Calculate admin performance summary
  const adminPerformanceSummary = await calculateAdminPerformance(
    conversations,
    targetDate
  );

  let processedUsers = 0;
  let newCustomers = 0;
  let updatedCustomers = 0;

  for (const [lineUserId, userConversations] of Object.entries(
    conversationsByUser
  )) {
    try {
      // Analyze conversation to extract customer info
      const analysisResult = await analyzeUserConversation(userConversations);

      if (analysisResult.hasCustomerInfo || analysisResult.summary) {
        // Check if customer already exists
        const existingCustomer = await fetchData("customers", {
          filters: { line_user_id: lineUserId },
          single: true,
        });

        // Prepare admin performance data for this customer
        const customerAdminPerformance =
          adminPerformanceSummary.byCustomer[lineUserId] || {};

        if (existingCustomer.success && existingCustomer.data) {
          // Update existing customer with new admin performance data
          const currentPerformance =
            existingCustomer.data.admin_performance_summary || {};
          const updatedPerformance = mergeAdminPerformance(
            currentPerformance,
            customerAdminPerformance,
            targetDate
          );

          const updateResult = await updateData(
            "customers",
            {
              customer_name:
                analysisResult.customerName ||
                existingCustomer.data.customer_name,
              customer_phone:
                analysisResult.customerPhone ||
                existingCustomer.data.customer_phone,
              line_username:
                analysisResult.lineUsername ||
                existingCustomer.data.line_username,
              conversation_summary: analysisResult.summary,
              admin_performance_summary: updatedPerformance,
              last_conversation_date: new Date().toISOString(),
              total_conversations:
                existingCustomer.data.total_conversations + 1,
              updated_at: new Date().toISOString(),
            },
            { line_user_id: lineUserId }
          );

          if (updateResult.success) {
            updatedCustomers++;
          }
        } else {
          // Create new customer with admin performance data
          const customerData = {
            line_user_id: lineUserId,
            line_username: analysisResult.lineUsername,
            customer_name: analysisResult.customerName,
            customer_phone: analysisResult.customerPhone,
            conversation_summary: analysisResult.summary,
            admin_performance_summary: {
              [targetDate]: customerAdminPerformance,
              overall_stats: {
                total_interactions:
                  customerAdminPerformance.total_messages || 0,
                avg_response_quality:
                  customerAdminPerformance.response_quality || 3.5,
                last_updated: new Date().toISOString(),
              },
            },
            last_conversation_date: new Date().toISOString(),
            total_conversations: 1,
            status: "active",
            metadata: {
              first_contact_date: targetDate,
              extracted_from_ai: true,
            },
          };

          const insertResult = await saveData("customers", customerData);

          if (insertResult.success) {
            newCustomers++;
          }
        }
      }

      processedUsers++;
    } catch (error) {
      console.error(`Error processing user ${lineUserId}:`, error);
    }
  }

  return {
    success: true,
    processed_users: processedUsers,
    new_customers: newCustomers,
    updated_customers: updatedCustomers,
    admin_performance_summary: adminPerformanceSummary.overall,
  };
}

async function calculateAdminPerformance(conversations, targetDate) {
  const adminConversations = conversations.filter(
    (conv) => conv.message_role === "admin"
  );

  // Group by admin and customer
  const performanceByAdmin = {};
  const performanceByCustomer = {};

  for (const conv of adminConversations) {
    const adminKey = conv.admin_id || "auto_system";
    const customerKey = conv.line_user_id;

    // Initialize admin performance tracking
    if (!performanceByAdmin[adminKey]) {
      performanceByAdmin[adminKey] = {
        admin_name: conv.admin_name || "Auto Response System",
        total_messages: 0,
        customers_helped: new Set(),
        conversations: [],
      };
    }

    // Initialize customer performance tracking
    if (!performanceByCustomer[customerKey]) {
      performanceByCustomer[customerKey] = {
        total_messages: 0,
        admins_involved: new Set(),
        response_times: [],
        conversations: [],
      };
    }

    performanceByAdmin[adminKey].total_messages++;
    performanceByAdmin[adminKey].customers_helped.add(customerKey);
    performanceByAdmin[adminKey].conversations.push(conv);

    performanceByCustomer[customerKey].total_messages++;
    performanceByCustomer[customerKey].admins_involved.add(adminKey);
    performanceByCustomer[customerKey].conversations.push(conv);
  }

  // Analyze performance using AI
  const overallPerformance = await analyzeOverallAdminPerformance(
    adminConversations,
    targetDate
  );

  // Convert Sets to arrays and add analysis
  const adminSummary = {};
  for (const [adminKey, data] of Object.entries(performanceByAdmin)) {
    const performanceAnalysis = await analyzeAdminSpecificPerformance(
      data.conversations
    );

    adminSummary[adminKey] = {
      admin_name: data.admin_name,
      total_messages: data.total_messages,
      customers_helped: data.customers_helped.size,
      response_quality: performanceAnalysis.response_quality || 3.5,
      customer_satisfaction: performanceAnalysis.customer_satisfaction || 3.5,
      performance_score: performanceAnalysis.performance_score || 3.5,
      summary: performanceAnalysis.summary,
      date: targetDate,
    };
  }

  // Customer-specific admin performance
  const customerSummary = {};
  for (const [customerKey, data] of Object.entries(performanceByCustomer)) {
    customerSummary[customerKey] = {
      total_messages: data.total_messages,
      admins_count: data.admins_involved.size,
      response_quality: overallPerformance.avg_response_quality || 3.5,
      last_interaction: targetDate,
    };
  }

  return {
    overall: {
      date: targetDate,
      total_admin_messages: adminConversations.length,
      unique_admins: Object.keys(performanceByAdmin).length,
      unique_customers: Object.keys(performanceByCustomer).length,
      avg_response_quality: overallPerformance.avg_response_quality || 3.5,
      summary: overallPerformance.summary,
      admin_breakdown: adminSummary,
    },
    byCustomer: customerSummary,
  };
}

function mergeAdminPerformance(currentPerformance, newPerformance, date) {
  const updated = { ...currentPerformance };

  // Add new date performance
  updated[date] = newPerformance;

  // Update overall stats
  if (!updated.overall_stats) {
    updated.overall_stats = {
      total_interactions: 0,
      avg_response_quality: 3.5,
      last_updated: new Date().toISOString(),
    };
  }

  updated.overall_stats.total_interactions +=
    newPerformance.total_messages || 0;
  updated.overall_stats.last_updated = new Date().toISOString();

  // Calculate rolling average of response quality
  const dates = Object.keys(updated).filter((key) => key !== "overall_stats");
  const qualityScores = dates
    .map((d) => updated[d].response_quality || 3.5)
    .filter((score) => score > 0);

  if (qualityScores.length > 0) {
    updated.overall_stats.avg_response_quality =
      qualityScores.reduce((sum, score) => sum + score, 0) /
      qualityScores.length;
  }

  return updated;
}

async function analyzeUserConversation(conversations) {
  try {
    // Prepare conversation text for AI analysis
    const conversationText = conversations
      .map((conv) => `${conv.message_role}: ${conv.message_content}`)
      .join("\n");

    // AI prompt for extracting customer information
    const extractionPrompt = `
    Analyze the following conversation and extract customer information. 
    Look for customer name, phone number, and provide a summary of the conversation.
    
    Conversation:
    ${conversationText}
    
    Please respond in JSON format with the following structure:
    {
      "hasCustomerInfo": boolean,
      "customerName": "string or null",
      "customerPhone": "string or null", 
      "lineUsername": "string or null",
      "summary": "conversation summary"
    }
    `;

    const aiResponse = await processAIRequest(
      [{ role: "user", content: extractionPrompt }],
      {},
      "web",
      { temperature: 0.3, maxTokens: 500 }
    );

    // Parse AI response
    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse.content);
    } catch (parseError) {
      // Fallback analysis if AI response is not JSON
      analysisResult = {
        hasCustomerInfo: false,
        customerName: null,
        customerPhone: null,
        lineUsername: conversations[0]?.line_username || null,
        summary: "Conversation analyzed but no customer info extracted",
      };
    }

    // Additional phone number extraction using regex
    if (!analysisResult.customerPhone) {
      const phoneRegex = /(\+66|0)[0-9]{8,9}/g;
      const phoneMatches = conversationText.match(phoneRegex);
      if (phoneMatches && phoneMatches.length > 0) {
        analysisResult.customerPhone = phoneMatches[0];
        analysisResult.hasCustomerInfo = true;
      }
    }

    return analysisResult;
  } catch (error) {
    console.error("Error analyzing conversation:", error);
    return {
      hasCustomerInfo: false,
      customerName: null,
      customerPhone: null,
      lineUsername: conversations[0]?.line_username || null,
      summary: "Error occurred during analysis",
    };
  }
}

async function analyzeOverallAdminPerformance(adminConversations, date) {
  try {
    const conversationSample = adminConversations
      .slice(0, 20) // Sample for AI analysis
      .map((conv) => `${conv.admin_name || "Auto"}: ${conv.message_content}`)
      .join("\n");

    const performancePrompt = `
    Analyze the following admin responses for ${date} and provide overall performance assessment:
    
    Admin Responses:
    ${conversationSample}
    
    Rate overall performance and provide summary.
    
    Respond in JSON format:
    {
      "avg_response_quality": number (1-5),
      "customer_service_score": number (1-5),
      "performance_score": number (1-5),
      "summary": "overall performance summary for the day"
    }
    `;

    const aiResponse = await processAIRequest(
      [{ role: "user", content: performancePrompt }],
      {},
      "web",
      { temperature: 0.3, maxTokens: 400 }
    );

    let performanceResult;
    try {
      performanceResult = JSON.parse(aiResponse.content);
    } catch (parseError) {
      performanceResult = {
        avg_response_quality: 3.5,
        customer_service_score: 3.5,
        performance_score: 3.5,
        summary: "Performance analysis completed for " + date,
      };
    }

    return performanceResult;
  } catch (error) {
    console.error("Error analyzing overall admin performance:", error);
    return {
      avg_response_quality: 3.0,
      customer_service_score: 3.0,
      performance_score: 3.0,
      summary: `Performance analysis failed: ${error.message}`,
    };
  }
}

async function analyzeAdminSpecificPerformance(conversations) {
  try {
    const conversationText = conversations
      .slice(0, 10)
      .map((conv) => conv.message_content)
      .join("\n");

    const performancePrompt = `
    Analyze these admin responses and rate the performance:
    
    ${conversationText}
    
    Respond in JSON format:
    {
      "response_quality": number (1-5),
      "customer_satisfaction": number (1-5),
      "performance_score": number (1-5),
      "summary": "performance summary"
    }
    `;

    const aiResponse = await processAIRequest(
      [{ role: "user", content: performancePrompt }],
      {},
      "web",
      { temperature: 0.3, maxTokens: 300 }
    );

    let result;
    try {
      result = JSON.parse(aiResponse.content);
    } catch (parseError) {
      result = {
        response_quality: 3.5,
        customer_satisfaction: 3.5,
        performance_score: 3.5,
        summary: "Analysis completed",
      };
    }

    return result;
  } catch (error) {
    return {
      response_quality: 3.0,
      customer_satisfaction: 3.0,
      performance_score: 3.0,
      summary: "Analysis failed",
    };
  }
}

async function cleanupOldConversations(daysToKeep = 1) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Delete conversations older than cutoff date
    const deleteResult = await deleteData("line_admin_conversations", {
      lt: { created_at: cutoffDate.toISOString() },
    });

    return {
      success: true,
      cutoff_date: cutoffDate.toISOString(),
      deleted_records: deleteResult.count || 0,
      message: `Cleaned up conversations older than ${daysToKeep} days`,
    };
  } catch (error) {
    console.error("Error cleaning up conversations:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Manual trigger endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];
  const cleanupDays = parseInt(searchParams.get("cleanup_days")) || 1;

  return await performDailyAnalysisWithCleanup(date, cleanupDays);
}
