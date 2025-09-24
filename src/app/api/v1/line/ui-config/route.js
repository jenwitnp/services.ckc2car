import { NextResponse } from "next/server";
import { lineConfigService } from "@/app/ai/adapters/line/config/lineConfig.js";

// ✅ GET - Load configuration data for UI
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    console.log("[UI Config API] GET request:", {
      action,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    });

    switch (action) {
      case "config":
        console.log("[UI Config API] Loading configuration for UI...");

        try {
          const dbConfig = await lineConfigService.getConfig();

          console.log("[UI Config API] Database config loaded:", {
            hasConfig: !!dbConfig,
            mode: dbConfig?.mode,
            businessHoursEnabled: dbConfig?.business_hours_enabled,
            smartResponse: dbConfig?.enable_smart_response,
            configId: dbConfig?.id,
          });

          // ✅ Transform database format to UI format
          const uiConfig = {
            mode: dbConfig?.mode || "manual",
            autoResponseDelay: dbConfig?.auto_response_delay || 0,
            enableSmartResponse: dbConfig?.enable_smart_response || false,

            businessHours: {
              enabled: dbConfig?.business_hours_enabled || false,
              start: dbConfig?.business_hours_start?.substring(0, 5) || "09:00",
              end: dbConfig?.business_hours_end?.substring(0, 5) || "18:00",
              timezone: dbConfig?.business_hours_timezone || "Asia/Bangkok",
              afterHoursMessage:
                dbConfig?.business_hours_after_hours_message ||
                "ขอบคุณสำหรับข้อความของคุณ ขณะนี้อยู่นอกเวลาทำการ เราจะติดต่อกลับในเวลาทำการ (9:00-18:00 น.)",
            },

            templates: {
              greeting:
                dbConfig?.template_greeting ||
                "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services มีอะไรให้เราช่วยเหลือไหมครับ/ค่ะ",
              carInquiry:
                dbConfig?.template_car_inquiry ||
                "ขอบคุณที่สนใจรถของเราครับ/ค่ะ เรามีรถหลากหลายรุ่นให้เลือก ท่านสนใจรถรุ่นไหนเป็นพิเศษไหมครับ/ค่ะ",
              pricing:
                dbConfig?.template_pricing ||
                "เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ ขอเบอร์โทรติดต่อหน่อยได้ไหมครับ/ค่ะ",
              contact:
                dbConfig?.template_contact ||
                "แอดมินจะติดต่อกลับไปให้ท่านในไม่ช้าครับ/ค่ะ หรือท่านสะดวกให้เราโทรหาเมื่อไหร่ครับ/ค่ะ",
            },

            ai: {
              useContext: dbConfig?.ai_use_context !== false,
              useCarData: dbConfig?.ai_use_car_data !== false,
              maxLength: dbConfig?.ai_max_length || 200,
              naturalness: dbConfig?.ai_naturalness || 0.7,
            },

            notifications: {
              newMessage: dbConfig?.notify_new_message !== false,
              afterHours: dbConfig?.notify_after_hours || false,
              aiError: dbConfig?.notify_ai_error !== false,
              lineNotify: dbConfig?.notify_line_notify !== false,
              email: dbConfig?.notify_email || false,
              webhook: dbConfig?.notify_webhook || false,
            },
          };

          console.log("[UI Config API] UI config prepared:", {
            mode: uiConfig.mode,
            businessHoursEnabled: uiConfig.businessHours.enabled,
            businessHoursRange: `${uiConfig.businessHours.start}-${uiConfig.businessHours.end}`,
            smartResponse: uiConfig.enableSmartResponse,
            templatesCount: Object.keys(uiConfig.templates).length,
            notificationsEnabled: Object.values(uiConfig.notifications).filter(
              Boolean
            ).length,
          });

          return NextResponse.json({
            success: true,
            config: uiConfig,
            metadata: {
              configId: dbConfig?.id,
              lastUpdated: dbConfig?.updated_at,
              active: dbConfig?.active,
            },
          });
        } catch (configError) {
          console.error("[UI Config API] Error loading config:", configError);

          // Return default config on error
          const defaultConfig = {
            mode: "manual",
            autoResponseDelay: 0,
            enableSmartResponse: false,
            businessHours: {
              enabled: true,
              start: "09:00",
              end: "18:00",
              timezone: "Asia/Bangkok",
              afterHoursMessage:
                "ขอบคุณสำหรับข้อความของคุณ ขณะนี้อยู่นอกเวลาทำการ เราจะติดต่อกลับในเวลาทำการ (9:00-18:00 น.)",
            },
            templates: {
              greeting: "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services",
              carInquiry: "ขอบคุณที่สนใจรถของเราครับ/ค่ะ",
              pricing: "เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ",
              contact: "แอดมินจะติดต่อกลับไปให้ท่านครับ/ค่ะ",
            },
            ai: {
              useContext: true,
              useCarData: true,
              maxLength: 200,
              naturalness: 0.7,
            },
            notifications: {
              newMessage: true,
              afterHours: false,
              aiError: true,
              lineNotify: true,
              email: false,
              webhook: false,
            },
          };

          console.log("[UI Config API] Returning default config due to error");

          return NextResponse.json({
            success: true,
            config: defaultConfig,
            metadata: {
              isDefault: true,
              error: configError.message,
            },
          });
        }

      case "daily_summary":
        const date =
          searchParams.get("date") || new Date().toISOString().split("T")[0];

        console.log("[UI Config API] Loading daily summary for:", date);

        try {
          const stats = await lineConfigService.getDailyStats(date);

          console.log("[UI Config API] Daily stats loaded:", {
            date,
            totalMessages: stats.total_messages,
            adminResponses: stats.admin_responses,
            autoResponses: stats.auto_responses,
            uniqueUsers: stats.unique_users,
            avgResponseTime: stats.avg_response_time_seconds,
          });

          // ✅ Transform for UI consumption
          const uiStats = {
            total_messages: stats.total_messages || 0,
            admin_responses: stats.outgoing_messages || 0,
            auto_responses: stats.auto_responses || 0,
            ai_responses: stats.ai_responses || 0,
            unique_users: stats.unique_users || 0,
            avg_response_time: stats.avg_response_time_seconds
              ? `${stats.avg_response_time_seconds}s`
              : "0s",
            auto_response_rate:
              stats.total_messages > 0
                ? Math.round(
                    (stats.auto_responses / stats.total_messages) * 100
                  )
                : 0,
          };

          return NextResponse.json({
            success: true,
            data: uiStats,
            metadata: {
              date,
              calculated: stats.calculated || false,
            },
          });
        } catch (statsError) {
          console.error(
            "[UI Config API] Error loading daily stats:",
            statsError
          );

          // Return mock data on error
          const mockStats = {
            total_messages: Math.floor(Math.random() * 50) + 10,
            admin_responses: Math.floor(Math.random() * 40) + 8,
            auto_responses: Math.floor(Math.random() * 30) + 5,
            ai_responses: Math.floor(Math.random() * 20) + 3,
            unique_users: Math.floor(Math.random() * 15) + 5,
            avg_response_time: "1.2s",
            auto_response_rate: Math.floor(Math.random() * 30) + 60,
          };

          console.log(
            "[UI Config API] Returning mock stats due to error:",
            mockStats
          );

          return NextResponse.json({
            success: true,
            data: mockStats,
            metadata: {
              date,
              isMock: true,
              error: statsError.message,
            },
          });
        }

      case "keywords":
        console.log("[UI Config API] Loading keywords...");

        try {
          const keywords = await lineConfigService.getKeywords();

          console.log("[UI Config API] Keywords loaded:", {
            count: keywords.length,
            topKeywords: keywords.slice(0, 3).map((k) => k.keyword),
          });

          return NextResponse.json({
            success: true,
            data: keywords,
          });
        } catch (keywordsError) {
          console.error(
            "[UI Config API] Error loading keywords:",
            keywordsError
          );

          return NextResponse.json({
            success: true,
            data: [],
            metadata: {
              error: keywordsError.message,
            },
          });
        }

      default:
        console.warn("[UI Config API] Unknown action:", action);
        return NextResponse.json(
          {
            success: false,
            error:
              "Unknown action. Available actions: config, daily_summary, keywords",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[UI Config API] GET Error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load configuration",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ✅ POST - Save configuration data from UI
export async function POST(request) {
  try {
    const body = await request.json();

    console.log("[UI Config API] POST request received:", {
      timestamp: new Date().toISOString(),
      hasBody: !!body,
      mode: body?.mode,
      businessHoursEnabled: body?.businessHours?.enabled,
      userAgent: request.headers.get("user-agent"),
    });

    console.log("[UI Config API] Configuration data received:", {
      mode: body.mode,
      autoResponseDelay: body.autoResponseDelay,
      enableSmartResponse: body.enableSmartResponse,
      businessHours: {
        enabled: body.businessHours?.enabled,
        range: body.businessHours
          ? `${body.businessHours.start}-${body.businessHours.end}`
          : "not set",
        timezone: body.businessHours?.timezone,
      },
      templatesCount: Object.keys(body.templates || {}).length,
      aiSettings: body.ai,
      notificationsEnabled: Object.values(body.notifications || {}).filter(
        Boolean
      ).length,
    });

    // ✅ Transform UI format to database format
    const configForDb = {
      mode: body.mode,
      autoResponseDelay: body.autoResponseDelay || 0,
      enableSmartResponse: body.enableSmartResponse || false,

      businessHours: {
        enabled: body.businessHours?.enabled || false,
        start: body.businessHours?.start || "09:00",
        end: body.businessHours?.end || "18:00",
        timezone: body.businessHours?.timezone || "Asia/Bangkok",
        afterHoursMessage:
          body.businessHours?.afterHoursMessage ||
          "ขอบคุณสำหรับข้อความของคุณ ขณะนี้อยู่นอกเวลาทำการ เราจะติดต่อกลับในเวลาทำการ (9:00-18:00 น.)",
      },

      smartResponse: {
        templates: {
          greeting:
            body.templates?.greeting ||
            "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services",
          carInquiry:
            body.templates?.carInquiry || "ขอบคุณที่สนใจรถของเราครับ/ค่ะ",
          pricing:
            body.templates?.pricing ||
            "เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ",
          contact:
            body.templates?.contact || "แอดมินจะติดต่อกลับไปให้ท่านครับ/ค่ะ",
        },
        aiSettings: {
          useContext: body.ai?.useContext !== false,
          useCarData: body.ai?.useCarData !== false,
          maxLength: body.ai?.maxLength || 200,
          naturalness: body.ai?.naturalness || 0.7,
        },
      },

      notifications: {
        newMessage: body.notifications?.newMessage !== false,
        afterHours: body.notifications?.afterHours || false,
        aiError: body.notifications?.aiError !== false,
        channels: {
          lineNotify: body.notifications?.lineNotify !== false,
          email: body.notifications?.email || false,
          webhook: body.notifications?.webhook || false,
        },
      },
    };

    console.log("[UI Config API] Transformed config for database:", {
      mode: configForDb.mode,
      businessHoursEnabled: configForDb.businessHours.enabled,
      businessHoursRange: `${configForDb.businessHours.start}-${configForDb.businessHours.end}`,
      smartResponse: configForDb.enableSmartResponse,
      templatesCount: Object.keys(configForDb.smartResponse.templates).length,
      notificationsEnabled: Object.values(configForDb.notifications).filter(
        Boolean
      ).length,
    });

    // ✅ Save to database using lineConfigService
    console.log("[UI Config API] Saving configuration to database...");

    try {
      const savedConfig = await lineConfigService.saveConfig(configForDb);

      console.log("[UI Config API] Configuration saved successfully:", {
        configId: savedConfig.id,
        mode: savedConfig.mode,
        active: savedConfig.active,
        timestamp: savedConfig.updated_at,
      });

      return NextResponse.json({
        success: true,
        message: "Configuration saved successfully",
        data: {
          id: savedConfig.id,
          mode: savedConfig.mode,
          updated_at: savedConfig.updated_at,
          active: savedConfig.active,
        },
      });
    } catch (saveError) {
      console.error("[UI Config API] Failed to save configuration:", {
        error: saveError.message,
        stack: saveError.stack,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save configuration to database",
          details: saveError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[UI Config API] POST Error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process configuration",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// ✅ DELETE - Reset configuration to defaults
export async function DELETE(request) {
  try {
    console.log("[UI Config API] DELETE request - resetting to defaults:", {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get("user-agent"),
    });

    const defaultConfigForDb = {
      mode: "manual",
      autoResponseDelay: 2,
      enableSmartResponse: false,

      businessHours: {
        enabled: true,
        start: "09:00",
        end: "18:00",
        timezone: "Asia/Bangkok",
        afterHoursMessage:
          "ขอบคุณสำหรับข้อความของคุณ ขณะนี้อยู่นอกเวลาทำการ เราจะติดต่อกลับในเวลาทำการ (9:00-18:00 น.)",
      },

      smartResponse: {
        templates: {
          greeting:
            "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services มีอะไรให้เราช่วยเหลือไหมครับ/ค่ะ",
          carInquiry:
            "ขอบคุณที่สนใจรถของเราครับ/ค่ะ เรามีรถหลากหลายรุ่นให้เลือก ท่านสนใจรถรุ่นไหนเป็นพิเศษไหมครับ/ค่ะ",
          pricing:
            "เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ ขอเบอร์โทรติดต่อหน่อยได้ไหมครับ/ค่ะ",
          contact:
            "แอดมินจะติดต่อกลับไปให้ท่านในไม่ช้าครับ/ค่ะ หรือท่านสะดวกให้เราโทรหาเมื่อไหร่ครับ/ค่ะ",
        },
        aiSettings: {
          useContext: true,
          useCarData: true,
          maxLength: 200,
          naturalness: 0.7,
        },
      },

      notifications: {
        newMessage: true,
        afterHours: false,
        aiError: true,
        channels: {
          lineNotify: true,
          email: false,
          webhook: false,
        },
      },
    };

    console.log("[UI Config API] Applying default configuration:", {
      mode: defaultConfigForDb.mode,
      businessHours: `${defaultConfigForDb.businessHours.start}-${defaultConfigForDb.businessHours.end}`,
      smartResponse: defaultConfigForDb.enableSmartResponse,
    });

    try {
      const savedConfig = await lineConfigService.saveConfig(
        defaultConfigForDb
      );

      console.log(
        "[UI Config API] Configuration reset to defaults successfully:",
        {
          configId: savedConfig.id,
          timestamp: savedConfig.updated_at,
        }
      );

      return NextResponse.json({
        success: true,
        message: "Configuration reset to defaults successfully",
        data: {
          id: savedConfig.id,
          mode: savedConfig.mode,
          updated_at: savedConfig.updated_at,
          active: savedConfig.active,
        },
      });
    } catch (resetError) {
      console.error("[UI Config API] Failed to reset configuration:", {
        error: resetError.message,
        stack: resetError.stack,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Failed to reset configuration",
          details: resetError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[UI Config API] DELETE Error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset configuration",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
