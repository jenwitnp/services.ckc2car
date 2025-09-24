import { lineConfigService } from "@/app/ai/adapters/line/config/lineConfig";

export class ConfigService {
  /**
   * ✅ Get admin response configuration
   */
  static async getAdminResponseConfig() {
    try {
      const config = await lineConfigService.getConfig();

      console.log("[Config] Loaded configuration:", {
        mode: config.mode,
        enableSmartResponse: config.enable_smart_response,
        businessHoursEnabled: config.business_hours_enabled,
        hasTemplates: !!(
          config.template_greeting || config.template_car_inquiry
        ),
      });

      return {
        mode: config.mode || "manual",
        autoResponseDelay: config.auto_response_delay || 0,
        enableSmartResponse: config.enable_smart_response || false,
        businessHours: {
          enabled: config.business_hours_enabled || false,
          start: config.business_hours_start?.substring(0, 5) || "09:00",
          end: config.business_hours_end?.substring(0, 5) || "18:00",
          timezone: config.business_hours_timezone || "Asia/Bangkok",
          afterHoursMessage:
            config.business_hours_after_hours_message ||
            "ขอบคุณสำหรับข้อความของคุณ ขณะนี้อยู่นอกเวลาทำการ เราจะติดต่อกลับในเวลาทำการ (9:00-18:00 น.)",
        },
        templates: {
          greeting:
            config.template_greeting ||
            "สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ CKC Car Services มีอะไรให้เราช่วยเหลือไหมครับ/ค่ะ",
          carInquiry:
            config.template_car_inquiry ||
            "ขอบคุณที่สนใจรถของเราครับ/ค่ะ เรามีรถหลากหลายรุ่นให้เลือก ท่านสนใจรถรุ่นไหนเป็นพิเศษไหมครับ/ค่ะ",
          pricing:
            config.template_pricing ||
            "เรื่องราคารถ เราจะแจ้งราคาพิเศษให้ท่านครับ/ค่ะ ขอเบอร์โทรติดต่อหน่อยได้ไหมครับ/ค่ะ",
          contact:
            config.template_contact ||
            "แอดมินจะติดต่อกลับไปให้ท่านในไม่ช้าครับ/ค่ะ หรือท่านสะดวกให้เราโทรหาเมื่อไหร่ครับ/ค่ะ",
        },
      };
    } catch (error) {
      console.error("Error getting admin response config:", error);
      return this.getDefaultConfig();
    }
  }

  /**
   * ✅ Get default configuration
   */
  static getDefaultConfig() {
    return {
      mode: "manual",
      autoResponseDelay: 0,
      enableSmartResponse: false,
      businessHours: {
        enabled: false,
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
    };
  }
}
