import { getCarDetailUrl } from "@/app/utils/urlUtils.server";

/**
 * LINE utilities service for server-side use (API routes)
 * Handles LINE platform integrations, LIFF URLs, and message formatting
 */
export class LineUtilsService {
  /**
   * ✅ Generate LIFF URL for any path
   */
  static createLiffUrl(path, options = {}) {
    const {
      liffId = process.env.LINE_LIFF_ID,
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
        "https://services.ckc2car.com",
      forceAbsolute = false,
    } = options;

    if (!liffId) {
      console.warn("LINE_LIFF_ID not configured, using direct URL");
      return path.startsWith("http") ? path : `${baseUrl}${path}`;
    }

    if (path.startsWith("http")) {
      const url = new URL(path);
      path = url.pathname + url.search;
    }

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `https://liff.line.me/${liffId}${cleanPath}`;
  }

  /**
   * ✅ Generate car detail LIFF URL
   */
  static createCarDetailLiffUrl(carData, absolute = false) {
    try {
      if (carData.public_url) {
        return this.createLiffUrl(carData.public_url);
      }

      const carForUrl = {
        id: carData.id,
        brand_name: carData.ยี่ห้อ || carData.brand_name,
        model_name: carData.รุ่น || carData.model_name,
        title: carData.รุ่นย่อย || carData.title || "",
        years_car: carData.รถปี || carData.years_car,
        no_car: carData.รหัสรถ || carData.no_car,
      };

      const carDetailUrl = getCarDetailUrl(carForUrl, absolute);
      return this.createLiffUrl(carDetailUrl);
    } catch (error) {
      console.error("Error creating car detail LIFF URL:", error);
      return this.createLiffUrl("/cars");
    }
  }

  /**
   * ✅ Generate search LIFF URL with query parameters
   */
  static createSearchLiffUrl(query = {}) {
    const searchQuery = {
      ...query,
      page: 1,
      pageSize: 20,
      limit: null,
    };

    const queryParam = encodeURIComponent(JSON.stringify(searchQuery));
    const searchPath = `/cars/search?q=${queryParam}&from=line`;
    return this.createLiffUrl(searchPath);
  }

  /**
   * ✅ Create account linking LIFF URL
   */
  static createAccountLinkingUrl(lineUserId, source = "customer") {
    const loginPath = `/login?lineUserId=${lineUserId}&source=${source}&redirect=${encodeURIComponent(
      "/profile"
    )}`;
    return this.createLiffUrl(loginPath);
  }

  /**
   * ✅ Verify LINE signature - SERVER SIDE ONLY
   */
  static verifySignature(body, signature, secret) {
    if (!signature || !secret) {
      console.warn("Missing signature or secret for LINE verification");
      return false;
    }

    try {
      // ✅ Server-side crypto import
      const crypto = require("crypto");

      const hash = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64");

      const result = hash === signature;

      console.log("Signature verification:", {
        expected: signature,
        calculated: hash,
        result: result,
      });

      return result;
    } catch (error) {
      console.error("Error verifying LINE signature:", error);
      return false;
    }
  }

  /**
   * ✅ Format LINE user profile
   */
  static formatUserProfile(profile) {
    return {
      userId: profile.userId,
      displayName: profile.displayName || "Unknown User",
      pictureUrl: profile.pictureUrl || null,
      statusMessage: profile.statusMessage || null,
      language: profile.language || "th",
    };
  }

  /**
   * ✅ Generate conversation session ID
   */
  static generateSessionId(lineUserId, type = "customer") {
    const today = new Date().toISOString().split("T")[0];
    const timestamp = Date.now().toString().slice(-6);
    return `${type}_${lineUserId}_${today}_${timestamp}`;
  }

  /**
   * ✅ Enhanced business hours check with timezone support
   */
  static checkBusinessHours(businessHoursConfig) {
    if (!businessHoursConfig || !businessHoursConfig.enabled) {
      return true;
    }

    const now = new Date();
    const timezone = businessHoursConfig.timezone || "Asia/Bangkok";

    try {
      const timeInTimezone = new Date(
        now.toLocaleString("en-US", { timeZone: timezone })
      );

      const currentHour = timeInTimezone.getHours();
      const currentMinute = timeInTimezone.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const startTimeStr = (businessHoursConfig.start || "09:00")
        .split(":")
        .slice(0, 2)
        .join(":");
      const endTimeStr = (businessHoursConfig.end || "18:00")
        .split(":")
        .slice(0, 2)
        .join(":");

      const [startHour, startMinute] = startTimeStr.split(":").map(Number);
      const [endHour, endMinute] = endTimeStr.split(":").map(Number);

      if (
        isNaN(startHour) ||
        isNaN(startMinute) ||
        isNaN(endHour) ||
        isNaN(endMinute)
      ) {
        console.warn(
          "Invalid business hours format, defaulting to always open"
        );
        return true;
      }

      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (startTime === 0 && endTime === 0) {
        return true;
      }

      let isWithinHours;
      if (endTime < startTime) {
        isWithinHours = currentTime >= startTime || currentTime <= endTime;
      } else {
        isWithinHours = currentTime >= startTime && currentTime <= endTime;
      }

      return isWithinHours;
    } catch (error) {
      console.error("Business hours check error:", error);
      return true;
    }
  }

  /**
   * ✅ Format conversation message for database
   */
  static formatMessageForDatabase(messageData, type = "customer") {
    const baseMessage = {
      // ✅ Match exact column names from your database
      line_user_id: messageData.lineUserId,
      line_username: messageData.lineUsername || null,
      message_role: messageData.role, // 'user' or 'admin'
      message_content: messageData.content,
      message_type: messageData.type || "text",
      conversation_session_id: messageData.sessionId,
      metadata: messageData.metadata || {},
      platform: "line", // Default value as shown in DB
      // ✅ created_at and updated_at will be handled by database (now() function)
    };

    return baseMessage;
  }

  /**
   * ✅ Validate LINE user ID format
   */
  static isValidLineUserId(userId) {
    if (!userId || typeof userId !== "string") return false;
    return /^U[a-f0-9]{32}$/i.test(userId);
  }

  /**
   * ✅ Sanitize text for LINE message
   */
  static sanitizeTextForLine(text, maxLength = 2000) {
    if (!text) return "";

    let sanitized = text.replace(/\s+/g, " ").trim();

    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength - 3) + "...";
    }

    return sanitized;
  }
}
