import { getCarDetailUrl } from "@/app/utils/urlUtils.server";

/**
 * ✅ Create car response (text or flex)
 */
export function createCarResponse(summary, functionResult) {
  const cars = functionResult.rawData?.slice(0, 10) || [];
  if (cars.length > 0) {
    // Check if we should use enhanced Flex Message or simple text
    const useFlexMessage = process.env.LINE_ENABLE_FLEX_MESSAGES !== "false";

    if (useFlexMessage && process.env.LINE_LIFF_ID) {
      return createEnhancedCarResponse(
        summary,
        cars,
        functionResult.count,
        functionResult.query
      );
    } else {
      return createSimpleCarTextResponse(summary, cars, functionResult.count);
    }
  }
  return { type: "text", text: summary };
}

/**
 * ✅ Create simple text response for cars
 */
export function createSimpleCarTextResponse(summary, cars, totalCount) {
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

    // ✅ Generate proper LIFF URL with SEO-friendly slug
    const carDetailUrl = generateCarDetailUrl(car);
    if (carDetailUrl) {
      const liffUrl = createLiffUrl(carDetailUrl);
      message += `   รายละเอียด: ${liffUrl}\n`;
    }
    message += `\n`;
  });

  if (totalCount > 3) {
    // Create LIFF URL for all cars search
    const allCarsLiffUrl = createLiffUrl("/cars/search");
    message += `ดูรถทั้งหมด: ${allCarsLiffUrl}`;
  }

  return { type: "text", text: message };
}

/**
 * ✅ Enhanced Flex Message for cars with LIFF integration
 */
export function createEnhancedCarResponse(
  summary,
  cars,
  totalCount,
  query = null
) {
  const liffId = process.env.LINE_LIFF_ID;

  if (!liffId) {
    // Fallback to simple text response
    return createSimpleCarTextResponse(summary, cars, totalCount);
  }

  // Create Flex Message with LIFF integration
  const carItems = cars.slice(0, 3).map((car, index) => {
    // ✅ Generate proper car detail URL
    const carDetailUrl = generateCarDetailUrl(car);

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
            // ✅ Use the proper SEO-friendly URL
            uri: createLiffUrl(carDetailUrl),
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
      ? createSearchLiffUrl(query)
      : createLiffUrl("/cars/search");
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
              summary.length > 100 ? summary.substring(0, 97) + "..." : summary,
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
 * ✅ Create account linking prompt
 */
export function createAccountLinkingPrompt(lineUserId) {
  const loginPath = `/login?lineUserId=${lineUserId}&source=line`;
  const liffUrl = createLiffUrl(loginPath);

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
 * ✅ Generate proper car detail URL
 */
export function generateCarDetailUrl(carData) {
  // If car already has a public_url, use it
  if (carData.public_url) {
    return carData.public_url;
  }

  // ✅ Use the proper URL generation function with car data structure
  const carForUrl = {
    id: carData.id,
    brand_name: carData.ยี่ห้อ || carData.brand_name,
    model_name: carData.รุ่น || carData.model_name,
    title: carData.รุ่นย่อย || carData.title || "",
    years_car: carData.รถปี || carData.years_car,
    no_car: carData.รหัสรถ || carData.no_car,
  };

  // Generate SEO-friendly URL
  return getCarDetailUrl(carForUrl, true); // absolute URL for LIFF
}

/**
 * ✅ Helper function to create LIFF URLs
 */
export function createLiffUrl(path) {
  const liffId = process.env.LINE_LIFF_ID;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://services.ckc2car.com";

  if (!liffId) {
    console.warn("LINE_LIFF_ID not configured, using direct URL");
    return path.startsWith("http") ? path : `${baseUrl}${path}`;
  }

  // ✅ Handle absolute URLs (from generateCarDetailUrl)
  if (path.startsWith("http")) {
    // Extract the path part from absolute URL
    const url = new URL(path);
    path = url.pathname;
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // Create LIFF URL
  const liffUrl = `https://liff.line.me/${liffId}${cleanPath}`;

  return liffUrl;
}

/**
 * ✅ Helper function to create search LIFF URL with query parameters
 */
export function createSearchLiffUrl(query) {
  const searchQuery = {
    ...query,
    page: 1,
    pageSize: 20,
    limit: null,
  };

  const queryParam = encodeURIComponent(JSON.stringify(searchQuery));
  const searchPath = `/cars/search?q=${queryParam}&from=line`;

  return createLiffUrl(searchPath);
}
