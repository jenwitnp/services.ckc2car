import { LineUtilsService } from "./LineUtilsService.js";

/**
 * Shared LINE response builder for both admin and customer chat
 */
export class LineResponseBuilder {
  /**
   * ✅ SHARED: Create simple text response
   */
  static createTextResponse(text) {
    return {
      type: "text",
      text: text,
    };
  }

  /**
   * ✅ SHARED: Create car list response (text format)
   */
  static createSimpleCarTextResponse(summary, cars, totalCount) {
    let message = `🚗 พบรถ ${totalCount} คัน\n\n`;
    const shortSummary =
      summary.length > 200 ? summary.substring(0, 197) + "..." : summary;
    message += `${shortSummary}\n\n`;

    const topCars = cars.slice(0, 3);
    topCars.forEach((car, index) => {
      message += `${index + 1}. ${car.ยี่ห้อ || car.brand_name} ${
        car.รุ่น || car.model_name
      } ${car.รถปี || car.years_car}\n`;
      message += `   ราคา: ${Number(car.ราคา || car.price || 0).toLocaleString(
        "th-TH"
      )} บาท\n`;
      message += `   ผ่อน: ${Number(
        car.ผ่อน || car.ins_price || 0
      ).toLocaleString("th-TH")} บาท\n`;
      message += `   สาขา: ${car.สาขา || car.branch_name || "ไม่ระบุ"}\n`;

      // ✅ Generate proper LIFF URL with SEO-friendly slug
      const carDetailUrl = LineUtilsService.createCarDetailLiffUrl(car);
      if (carDetailUrl) {
        message += `   รายละเอียด: ${carDetailUrl}\n`;
      }
      message += `\n`;
    });

    if (totalCount > 3) {
      const allCarsLiffUrl = LineUtilsService.createSearchLiffUrl();
      message += `ดูรถทั้งหมด: ${allCarsLiffUrl}`;
    }

    return this.createTextResponse(message);
  }

  /**
   * ✅ SHARED: Create enhanced flex message for cars (if LIFF enabled)
   */
  static createEnhancedCarResponse(summary, cars, totalCount, query = null) {
    const liffId = process.env.LINE_LIFF_ID;

    if (!liffId) {
      // Fallback to simple text response
      return this.createSimpleCarTextResponse(summary, cars, totalCount);
    }

    // Create Flex Message with LIFF integration
    const carItems = cars.slice(0, 3).map((car, index) => {
      const carDetailUrl = LineUtilsService.createCarDetailLiffUrl(car);

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
                text: `${car.ยี่ห้อ || car.brand_name} ${
                  car.รุ่น || car.model_name
                } ${car.รถปี || car.years_car}`,
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
                text: `${Number(car.ราคา || car.price || 0).toLocaleString(
                  "th-TH"
                )} บาท`,
                size: "xs",
                color: "#FF6B6B",
                weight: "bold",
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
              uri: carDetailUrl,
            },
          },
        ],
      };
    });

    // Create footer with "View All" button
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
        ? LineUtilsService.createSearchLiffUrl(query)
        : LineUtilsService.createSearchLiffUrl();

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
   * ✅ SHARED: Create account linking prompt
   */
  static createAccountLinkingPrompt(lineUserId, userType = "customer") {
    const loginUrl = LineUtilsService.createAccountLinkingUrl(
      lineUserId,
      userType
    );

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
              text:
                userType === "admin"
                  ? "เพื่อเข้าถึงระบบจัดการ คุณจำเป็นต้องเชื่อมต่อบัญชี LINE กับระบบ CRM ของเราก่อน"
                  : "เพื่อทำการนัดหมาย คุณจำเป็นต้องเชื่อมต่อบัญชี LINE กับระบบ CRM ของเราก่อนค่ะ",
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
                uri: loginUrl,
              },
            },
          ],
        },
      },
    };
  }

  /**
   * ✅ SHARED: Choose appropriate car response format
   */
  static createCarResponse(summary, functionResult, useFlexMessage = true) {
    const cars = functionResult.rawData?.slice(0, 10) || [];

    if (cars.length > 0) {
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

    return this.createTextResponse(summary);
  }
}
