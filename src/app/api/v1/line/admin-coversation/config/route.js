import { NextResponse } from "next/server";
import { lineConfigService } from "@/app/services/supabase/lineConfig";

// GET - Retrieve current configuration
export async function GET(request) {
  try {
    const config = await lineConfigService.getConfig();

    // Transform database format to UI format
    const uiConfig = {
      mode: config.mode,
      autoResponseDelay: config.auto_response_delay,
      enableSmartResponse: config.enable_smart_response,
      businessHours: {
        enabled: config.business_hours_enabled,
        start: config.business_hours_start,
        end: config.business_hours_end,
        timezone: config.business_hours_timezone,
        afterHoursMessage: config.business_hours_after_hours_message,
      },
      smartResponse: {
        templates: {
          greeting: config.template_greeting,
          carInquiry: config.template_car_inquiry,
          pricing: config.template_pricing,
          contact: config.template_contact,
        },
        aiSettings: {
          useContext: config.ai_use_context,
          useCarData: config.ai_use_car_data,
          maxLength: config.ai_max_length,
          naturalness: config.ai_naturalness,
        },
      },
      notifications: {
        newMessage: config.notify_new_message,
        afterHours: config.notify_after_hours,
        aiError: config.notify_ai_error,
        channels: {
          lineNotify: config.notify_line_notify,
          email: config.notify_email,
          webhook: config.notify_webhook,
        },
      },
      active: config.active,
    };

    return NextResponse.json({
      success: true,
      config: uiConfig,
    });
  } catch (error) {
    console.error("Failed to get config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve configuration" },
      { status: 500 }
    );
  }
}

// POST - Save configuration
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { mode } = body;

    if (!mode || !["off", "manual", "auto", "ai"].includes(mode)) {
      return NextResponse.json(
        { success: false, error: "Invalid mode" },
        { status: 400 }
      );
    }

    const savedConfig = await lineConfigService.saveConfig(body);

    return NextResponse.json({
      success: true,
      message: "Configuration saved successfully",
      config: savedConfig,
    });
  } catch (error) {
    console.error("Failed to save config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}
