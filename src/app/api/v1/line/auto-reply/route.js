import { NextResponse } from "next/server";
import { processLineRequest } from "@/app/ai/adapters/line.js";

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, mode, config } = body;

    console.log("[LINE Test API] Test request received:", {
      timestamp: new Date().toISOString(),
      message: message?.substring(0, 50) + (message?.length > 50 ? "..." : ""),
      messageLength: message?.length,
      mode: mode,
      configMode: config?.mode,
    });

    console.log("[LINE Test API] Full test configuration:", {
      mode,
      autoResponseDelay: config?.autoResponseDelay,
      enableSmartResponse: config?.enableSmartResponse,
      businessHoursEnabled: config?.businessHours?.enabled,
      businessHoursRange: config?.businessHours
        ? `${config.businessHours.start}-${config.businessHours.end}`
        : "not set",
    });

    // ✅ Simulate different response modes
    let response;
    let processingTime = 0;
    const startTime = Date.now();

    switch (mode) {
      case "off":
        console.log("[LINE Test API] Mode: OFF - No response");
        response = null;
        break;

      case "manual":
        console.log("[LINE Test API] Mode: MANUAL - Manual response only");
        response = "โหมด Manual - แอดมินจะตอบกลับเอง (ไม่มีการตอบอัตโนมัติ)";
        break;

      case "auto":
        console.log("[LINE Test API] Mode: AUTO - Simple auto response");
        // Simulate simple template matching
        if (message.includes("สวัสดี") || message.includes("หวัดดี")) {
          response =
            config?.templates?.greeting ||
            "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services";
        } else if (message.includes("รถ") || message.includes("ราคา")) {
          response =
            config?.templates?.carInquiry || "ขอบคุณที่สนใจรถของเราครับ/ค่ะ";
        } else if (message.includes("ติดต่อ") || message.includes("โทร")) {
          response =
            config?.templates?.contact || "แอดมินจะติดต่อกลับไปให้ท่านครับ/ค่ะ";
        } else {
          response =
            "ขอบคุณสำหรับข้อความของคุณ แอดมินจะติดต่อกลับในไม่ช้าครับ/ค่ะ";
        }
        break;

      case "ai":
        console.log("[LINE Test API] Mode: AI - Using AI adapter");

        // ✅ Use the actual LINE adapter for AI processing
        const testContext = {
          userId: "test-user-" + Date.now(),
          userName: "Test User",
          platform: "line",
          source: { type: "user" },
          timestamp: Date.now(),
          messageId: "test-message-" + Date.now(),
          headers: {
            "x-line-channel-id": "admin-conversation",
            "user-agent": "LINE-Test-Client",
          },
        };

        console.log("[LINE Test API] Processing with AI adapter:", {
          userId: testContext.userId,
          messageLength: message.length,
        });

        try {
          const aiResponse = await processLineRequest(message, testContext);

          console.log("[LINE Test API] AI Response received:", {
            type: aiResponse?.type,
            hasText: !!aiResponse?.text,
            textLength: aiResponse?.text?.length || 0,
            processingTime: Date.now() - startTime,
          });

          response = aiResponse?.text || "AI ไม่สามารถตอบกลับได้ในขณะนี้";
        } catch (aiError) {
          console.error("[LINE Test API] AI Error:", aiError);
          response = "เกิดข้อผิดพลาดในการประมวลผล AI: " + aiError.message;
        }
        break;

      default:
        console.warn("[LINE Test API] Unknown mode:", mode);
        response = "โหมดไม่ถูกต้อง";
    }

    processingTime = Date.now() - startTime;

    // ✅ Simulate response delay if configured
    if (config?.autoResponseDelay > 0 && response) {
      console.log(
        "[LINE Test API] Simulating response delay:",
        config.autoResponseDelay + "s"
      );
      await new Promise((resolve) =>
        setTimeout(resolve, config.autoResponseDelay * 1000)
      );
    }

    console.log("[LINE Test API] Test completed:", {
      mode,
      hasResponse: !!response,
      responseLength: response?.length || 0,
      totalProcessingTime: Date.now() - startTime,
      aiProcessingTime: processingTime,
    });

    return NextResponse.json({
      success: true,
      response: response,
      mode: mode,
      processingTime: Date.now() - startTime,
      metadata: {
        aiProcessingTime: processingTime,
        responseDelay: config?.autoResponseDelay || 0,
        smartResponseUsed: config?.enableSmartResponse && mode === "ai",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[LINE Test API] Error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
