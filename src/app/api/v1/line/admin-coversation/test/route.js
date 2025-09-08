import { NextResponse } from "next/server";
import { lineConfigService } from "@/app/services/supabase/lineConfig";

export async function POST(request) {
  try {
    const body = await request.json();
    const { message, mode, config } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Get current config if not provided
    let currentConfig = config;
    if (!currentConfig) {
      const dbConfig = await lineConfigService.getConfig();
      currentConfig = {
        mode: dbConfig.mode,
        enableSmartResponse: dbConfig.enable_smart_response,
        businessHours: {
          enabled: dbConfig.business_hours_enabled,
          start: dbConfig.business_hours_start,
          end: dbConfig.business_hours_end,
          timezone: dbConfig.business_hours_timezone,
          afterHoursMessage: dbConfig.business_hours_after_hours_message,
        },
        smartResponse: {
          templates: {
            greeting: dbConfig.template_greeting,
            carInquiry: dbConfig.template_car_inquiry,
            pricing: dbConfig.template_pricing,
            contact: dbConfig.template_contact,
          },
        },
      };
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    let response = "";
    let responseMode = currentConfig.mode || mode || "auto";

    switch (responseMode) {
      case "off":
        response = null;
        break;

      case "manual":
        response = "ข้อความของคุณถูกส่งให้แอดมินแล้ว เราจะติดต่อกลับในไม่ช้า";
        break;

      case "auto":
        response = simulateAutoResponse(message, currentConfig);
        break;

      case "ai":
        response = await simulateAIResponse(message, currentConfig);
        break;

      default:
        response = "ขอบคุณสำหรับข้อความของคุณ";
    }

    // Check business hours
    if (currentConfig.businessHours?.enabled && response) {
      console.log("เวลาทำการ : ", currentConfig.businessHours);
      const isBusinessHours = checkBusinessHours(currentConfig.businessHours);
      if (!isBusinessHours) {
        response =
          currentConfig.businessHours.afterHoursMessage ||
          "ขอบคุณสำหรับข้อความของคุณ ขณะนี้อยู่นอกเวลาทำการ เราจะติดต่อกลับในเวลาทำการ";
      }
    }

    return NextResponse.json({
      success: true,
      response: response,
      mode: responseMode,
      timestamp: new Date().toISOString(),
      businessHours: currentConfig.businessHours?.enabled
        ? checkBusinessHours(currentConfig.businessHours)
        : null,
    });
  } catch (error) {
    console.error("Test response error:", error);
    return NextResponse.json({
      success: false,
      error: true,
      message: "เกิดข้อผิดพลาดในการทดสอบ",
    });
  }
}

// Helper functions
function simulateAutoResponse(message, config) {
  const msg = message.toLowerCase();
  const templates = config.smartResponse?.templates;

  if (msg.includes("สวัสดี") || msg.includes("hello") || msg.includes("hi")) {
    return templates?.greeting || "สวัสดีครับ/ค่ะ มีอะไรให้ช่วยไหมครับ/ค่ะ";
  }

  if (
    msg.includes("ราคา") ||
    msg.includes("price") ||
    msg.includes("เท่าไหร่")
  ) {
    return (
      templates?.pricing || "เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ"
    );
  }

  if (msg.includes("รถ") || msg.includes("car") || msg.includes("สเปค")) {
    return templates?.carInquiry || "ขอบคุณที่สนใจรถของเราครับ/ค่ะ";
  }

  if (
    msg.includes("ติดต่อ") ||
    msg.includes("contact") ||
    msg.includes("โทร")
  ) {
    return templates?.contact || "แอดมินจะติดต่อกลับไปให้ท่านในไม่ช้าครับ/ค่ะ";
  }

  return "ขอบคุณสำหรับข้อความของคุณ แอดมินจะติดต่อกลับในไม่ช้า";
}

async function simulateAIResponse(message, config) {
  const responses = [
    "ขอบคุณสำหรับคำถามของคุณ ตอนนี้ผมจะช่วยหาข้อมูลที่ท่านต้องการให้นะครับ",
    "เข้าใจแล้วครับ ให้ผมตรวจสอบข้อมูลและตอบกลับให้ท่านในไม่ช้า",
    "สำหรับคำถามของท่าน เรามีข้อมูลที่น่าสนใจมาฝากครับ",
  ];

  const randomResponse =
    responses[Math.floor(Math.random() * responses.length)];
  const maxLength = config.smartResponse?.aiSettings?.maxLength || 200;

  return randomResponse.length > maxLength
    ? randomResponse.substring(0, maxLength - 3) + "..."
    : randomResponse;
}

function checkBusinessHours(businessHours) {
  if (!businessHours.enabled) return true;

  console.log("Business hours config:", businessHours);

  const now = new Date();
  const timezone = businessHours.timezone || "Asia/Bangkok";

  // Get current time in the specified timezone
  const timeInTimezone = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );

  const currentHour = timeInTimezone.getHours();
  const currentMinute = timeInTimezone.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Parse start and end times - handle both HH:MM and HH:MM:SS formats
  let startTime, endTime;

  try {
    // Remove seconds if present (00:00:00 -> 00:00)
    const startTimeStr = businessHours.start.split(":").slice(0, 2).join(":");
    const endTimeStr = businessHours.end.split(":").slice(0, 2).join(":");

    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    const [endHour, endMinute] = endTimeStr.split(":").map(Number);

    // Validate parsed values
    if (
      isNaN(startHour) ||
      isNaN(startMinute) ||
      isNaN(endHour) ||
      isNaN(endMinute)
    ) {
      console.error("Invalid time format in business hours");
      return true; // Default to always open if time format is invalid
    }

    startTime = startHour * 60 + startMinute;
    endTime = endHour * 60 + endMinute;
  } catch (error) {
    console.error("Error parsing business hours:", error);
    return true; // Default to always open if parsing fails
  }

  // Special case: if start and end are both 00:00, treat as 24/7
  if (startTime === 0 && endTime === 0) {
    console.log("24/7 operation detected (00:00-00:00)");
    return true;
  }

  // Handle overnight business hours (e.g., 22:00 to 06:00)
  let isWithinHours;
  if (endTime < startTime) {
    // Overnight hours: current time should be after start OR before end
    isWithinHours = currentTime >= startTime || currentTime <= endTime;
  } else {
    // Normal hours: current time should be between start and end
    isWithinHours = currentTime >= startTime && currentTime <= endTime;
  }

  console.log("Time check details:", {
    currentTime: `${currentHour}:${currentMinute
      .toString()
      .padStart(2, "0")} (${currentTime} minutes)`,
    startTime: `${Math.floor(startTime / 60)}:${(startTime % 60)
      .toString()
      .padStart(2, "0")} (${startTime} minutes)`,
    endTime: `${Math.floor(endTime / 60)}:${(endTime % 60)
      .toString()
      .padStart(2, "0")} (${endTime} minutes)`,
    timezone: timezone,
    isWithinHours: isWithinHours,
    isOvernight: endTime < startTime,
  });

  return isWithinHours;
}
