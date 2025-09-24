import { getCarDetailUrl } from "@/app/utils/urlUtils.server";

/**
 * ✅ Unified LINE Response Builder
 * Consolidates LineResponseBuilder and responseHelpers functionality
 */
export class LineResponseBuilder {
  /**
   * ✅ Create simple text response
   */
  static createTextResponse(text) {
    return {
      type: "text",
      text: text,
    };
  }

  /**
   * ✅ Create quick reply response
   */
  static createQuickReplyResponse(text, quickReplyItems) {
    return {
      type: "text",
      text: text,
      quickReply: {
        items: quickReplyItems.map((item) => ({
          type: "action",
          action: {
            type: "message",
            label: item.label,
            text: item.text || item.label,
          },
        })),
      },
    };
  }

  /**
   * ✅ Create postback quick reply
   */
  static createPostbackQuickReply(text, postbackItems) {
    return {
      type: "text",
      text: text,
      quickReply: {
        items: postbackItems.map((item) => ({
          type: "action",
          action: {
            type: "postback",
            label: item.label,
            data: item.data,
            text: item.displayText || item.label,
          },
        })),
      },
    };
  }

  /**
   * ✅ Create image response
   */
  static createImageResponse(originalContentUrl, previewImageUrl = null) {
    return {
      type: "image",
      originalContentUrl: originalContentUrl,
      previewImageUrl: previewImageUrl || originalContentUrl,
    };
  }

  /**
   * ✅ Create video response
   */
  static createVideoResponse(originalContentUrl, previewImageUrl) {
    return {
      type: "video",
      originalContentUrl: originalContentUrl,
      previewImageUrl: previewImageUrl,
    };
  }

  /**
   * ✅ Create sticker response
   */
  static createStickerResponse(packageId, stickerId) {
    return {
      type: "sticker",
      packageId: packageId.toString(),
      stickerId: stickerId.toString(),
    };
  }

  /**
   * ✅ Create location response
   */
  static createLocationResponse(title, address, latitude, longitude) {
    return {
      type: "location",
      title: title,
      address: address,
      latitude: latitude,
      longitude: longitude,
    };
  }

  /**
   * ✅ Create audio response
   */
  static createAudioResponse(originalContentUrl, duration) {
    return {
      type: "audio",
      originalContentUrl: originalContentUrl,
      duration: duration,
    };
  }

  /**
   * ✅ Create error response
   */
  static createErrorResponse(message = null) {
    const defaultMessage =
      "ขออภัยครับ เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้งครับ";
    return this.createTextResponse(message || defaultMessage);
  }

  /**
   * ✅ Create multiple responses
   */
  static createMultipleResponses(responses) {
    return responses.map((response) => {
      if (typeof response === "string") {
        return this.createTextResponse(response);
      }
      return response;
    });
  }

  /**
   * ✅ UNIFIED: Create car response (consolidates both implementations)
   */
  static createCarResponse(summary, functionResult) {
    const cars = functionResult.rawData?.slice(0, 10) || [];
    if (cars.length === 0) {
      return this.createTextResponse(summary);
    }

    const useFlexMessage = process.env.LINE_ENABLE_FLEX_MESSAGES !== "false";

    if (useFlexMessage && process.env.LINE_LIFF_ID) {
      return this.createEnhancedCarResponse(
        summary,
        cars,
        functionResult.count,
        functionResult.query
      );
    } else {
      return this.createSimpleCarTextResponse(
        summary,
        cars,
        functionResult.count
      );
    }
  }

  /**
   * ✅ UNIFIED: Simple text response for cars
   */
  static createSimpleCarTextResponse(summary, cars, totalCount) {
    let message = `🚗 พบรถ ${totalCount} คัน\n\n`;
    const shortSummary =
      summary.length > 200 ? summary.substring(0, 197) + "..." : summary;
    message += `${shortSummary}\n\n`;

    const topCars = cars.slice(0, 3);
    topCars.forEach((car, index) => {
      message += `${index + 1}. ${car.ยี่ห้อ} ${car.รุ่น} ${car.รถปี}\n`;
      message += `   ราคา: ${Number(car.ราคา).toLocaleString("th-TH")} บาท\n`;
      message += `   ผ่อน: ${Number(car.ผ่อน).toLocaleString("th-TH")} บาท\n`;
      message += `   สาขา: ${car.สาขา}\n`;

      const carDetailUrl = this.generateCarDetailUrl(car);
      if (carDetailUrl) {
        const liffUrl = this.createLiffUrl(carDetailUrl);
        message += `   รายละเอียด: ${liffUrl}\n`;
      }
      message += `\n`;
    });

    if (totalCount > 3) {
      const allCarsLiffUrl = this.createLiffUrl("/cars/search");
      message += `ดูรถทั้งหมด: ${allCarsLiffUrl}`;
    }

    return this.createTextResponse(message);
  }

  /**
   * ✅ UNIFIED: Enhanced Flex Message for cars
   */
  static createEnhancedCarResponse(summary, cars, totalCount, query = null) {
    const liffId = process.env.LINE_LIFF_ID;

    if (!liffId) {
      return this.createSimpleCarTextResponse(summary, cars, totalCount);
    }

    const carItems = cars.slice(0, 3).map((car) => {
      const carDetailUrl = this.generateCarDetailUrl(car);

      return {
        type: "box",
        layout: "vertical",
        margin: "lg",
        spacing: "sm",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: `${car.ยี่ห้อ} ${car.รุ่น} ${car.รถปี}`,
                weight: "bold",
                size: "sm",
                flex: 1,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ราคา:",
                size: "xs",
                color: "#666666",
                flex: 1,
              },
              {
                type: "text",
                text: `${Number(car.ราคา).toLocaleString("th-TH")} บาท`,
                size: "xs",
                color: "#FF6B6B",
                weight: "bold",
                flex: 2,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ผ่อน:",
                size: "xs",
                color: "#666666",
                flex: 1,
              },
              {
                type: "text",
                text: `${Number(car.ผ่อน).toLocaleString("th-TH")} บาท/เดือน`,
                size: "xs",
                color: "#4ECDC4",
                weight: "bold",
                flex: 2,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "สาขา:",
                size: "xs",
                color: "#666666",
                flex: 1,
              },
              {
                type: "text",
                text: car.สาขา || "ไม่ระบุ",
                size: "xs",
                color: "#333333",
                flex: 2,
              },
            ],
          },
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#4ECDC4",
            margin: "md",
            action: {
              type: "uri",
              label: "ดูรายละเอียด",
              uri: this.createLiffUrl(carDetailUrl),
            },
          },
        ],
      };
    });

    const footerContents = [
      {
        type: "separator",
        margin: "lg",
      },
      {
        type: "box",
        layout: "horizontal",
        margin: "lg",
        contents: [
          {
            type: "text",
            text: `พบรถทั้งหมด ${totalCount} คัน`,
            size: "sm",
            color: "#666666",
            flex: 1,
          },
        ],
      },
    ];

    if (totalCount > 3) {
      const searchUrl = query
        ? this.createSearchLiffUrl(query)
        : this.createLiffUrl("/cars/search");
      footerContents.push({
        type: "button",
        style: "secondary",
        height: "sm",
        margin: "md",
        action: {
          type: "uri",
          label: "ดูรถทั้งหมด",
          uri: searchUrl,
        },
      });
    }

    return {
      type: "flex",
      altText: `พบรถ ${totalCount} คัน`,
      contents: {
        type: "bubble",
        header: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: `🚗 พบรถ ${totalCount} คัน`,
              weight: "bold",
              size: "lg",
              color: "#4ECDC4",
            },
            {
              type: "text",
              text:
                summary.length > 100
                  ? summary.substring(0, 97) + "..."
                  : summary,
              wrap: true,
              size: "sm",
              color: "#666666",
              margin: "md",
            },
          ],
        },
        body: {
          type: "box",
          layout: "vertical",
          contents: carItems,
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: footerContents,
        },
      },
    };
  }

  /**
   * ✅ UNIFIED: Account linking prompt
   */
  static createAccountLinkingPrompt(lineUserId) {
    const loginPath = `/login?lineUserId=${lineUserId}&source=line`;
    const liffUrl = this.createLiffUrl(loginPath);

    return {
      type: "flex",
      altText: "กรุณาเชื่อมต่อบัญชีก่อนทำการนัดหมาย",
      contents: {
        type: "bubble",
        body: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "🔐 จำเป็นต้องเชื่อมต่อบัญชี",
              weight: "bold",
              size: "lg",
              color: "#FF6B6B",
            },
            {
              type: "text",
              text: "เพื่อทำการนัดหมาย คุณจำเป็นต้องเชื่อมต่อบัญชี LINE กับระบบ CRM ของเราก่อนค่ะ",
              wrap: true,
              margin: "md",
              color: "#666666",
            },
          ],
        },
        footer: {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "button",
              style: "primary",
              color: "#4ECDC4",
              action: {
                type: "uri",
                label: "เชื่อมต่อบัญชี",
                uri: liffUrl,
              },
            },
          ],
        },
      },
    };
  }

  /**
   * ✅ UNIFIED: Template response (for template matching)
   */
  static createTemplateResponse(templateText, templateType = null) {
    const response = this.createTextResponse(templateText);

    // Add metadata for tracking
    if (templateType) {
      response._metadata = {
        templateType,
        isTemplate: true,
        generatedAt: new Date().toISOString(),
      };
    }

    return response;
  }

  /**
   * ✅ UNIFIED: Business hours response
   */
  static createBusinessHoursResponse(afterHoursMessage, businessHours) {
    const defaultMessage = `ขออภัยค่ะ ขณะนี้อยู่นอกเวลาทำการ เวลาทำการคือ ${businessHours.start} - ${businessHours.end} น. เราจะตอบกลับในเวลาทำการนะคะ`;

    return this.createTextResponse(afterHoursMessage || defaultMessage);
  }

  // ============================================
  // ✅ UNIFIED UTILITY METHODS
  // ============================================

  /**
   * ✅ UNIFIED: Generate proper car detail URL
   */
  static generateCarDetailUrl(carData) {
    if (carData.public_url) {
      return carData.public_url;
    }

    const carForUrl = {
      id: carData.id,
      brand_name: carData.ยี่ห้อ || carData.brand_name,
      model_name: carData.รุ่น || carData.model_name,
      title: carData.รุ่นย่อย || carData.title || "",
      years_car: carData.รถปี || carData.years_car,
      no_car: carData.รหัสรถ || carData.no_car,
    };

    return getCarDetailUrl(carForUrl, true);
  }

  /**
   * ✅ UNIFIED: Create LIFF URLs
   */
  static createLiffUrl(path) {
    const liffId = process.env.LINE_LIFF_ID;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "https://services.ckc2car.com";

    if (!liffId) {
      console.warn("LINE_LIFF_ID not configured, using direct URL");
      return path.startsWith("http") ? path : `${baseUrl}${path}`;
    }

    if (path.startsWith("http")) {
      const url = new URL(path);
      path = url.pathname;
    }

    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `https://liff.line.me/${liffId}${cleanPath}`;
  }

  /**
   * ✅ UNIFIED: Create search LIFF URL
   */
  static createSearchLiffUrl(query) {
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
   * ✅ UNIFIED: Validate response object
   */
  static validateResponse(response) {
    if (!response || typeof response !== "object") {
      return false;
    }

    const validTypes = [
      "text",
      "image",
      "video",
      "audio",
      "file",
      "location",
      "sticker",
      "imagemap",
      "template",
      "flex",
    ];

    if (!validTypes.includes(response.type)) {
      return false;
    }

    // Type-specific validation
    switch (response.type) {
      case "text":
        return typeof response.text === "string" && response.text.length > 0;
      case "flex":
        return response.contents && typeof response.contents === "object";
      case "image":
        return response.originalContentUrl && response.previewImageUrl;
      default:
        return true;
    }
  }

  /**
   * ✅ UNIFIED: Get response size (for monitoring)
   */
  static getResponseSize(response) {
    try {
      return JSON.stringify(response).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * ✅ UNIFIED: Truncate text if too long
   */
  static truncateText(text, maxLength = 2000) {
    if (!text || text.length <= maxLength) {
      return text;
    }

    return text.substring(0, maxLength - 3) + "...";
  }
}

// ✅ Export as both named and default export for compatibility
export default LineResponseBuilder;
