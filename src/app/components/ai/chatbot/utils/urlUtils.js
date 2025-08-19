export const urlUtils = {
  openCarDetail: (fullUrl, title, carId) => {
    console.log("Car detail clicked:", { fullUrl, title, carId });

    if (fullUrl) {
      const url = fullUrl.startsWith("http")
        ? fullUrl
        : `${window.location.origin}${fullUrl}`;

      console.log("Opening car detail URL:", url);
      window.open(url, "_blank");
    }
  },

  openSearchResults: (query) => {
    try {
      const baseUrl = window.location.origin;
      const searchQuery = {
        ...query,
        page: 1,
        pageSize: 20,
        limit: null,
      };

      const queryParam = encodeURIComponent(JSON.stringify(searchQuery));
      const searchUrl = `${baseUrl}/cars/search?q=${queryParam}&from=ai`;

      console.log("[urlUtils] Opening search URL:", searchUrl);
      window.open(searchUrl, "_blank");
    } catch (error) {
      console.error("[urlUtils] Error opening search:", error);
      alert("ขออภัยค่ะ ไม่สามารถเปิดหน้าค้นหาได้ กรุณาลองใหม่อีกครั้ง");
    }
  },

  openFallbackSearch: () => {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/cars/search?from=ai&fallback=true`, "_blank");
  },

  // ✅ New method: Generate car detail URL
  generateCarDetailUrl: (carData) => {
    // If public_url exists, use it
    if (carData.public_url) {
      return carData.public_url;
    }

    // Generate URL from car data
    const brand = carData.brand_name || carData.ยี่ห้อ || "";
    const model = carData.model_name || carData.รุ่น || "";
    const year = carData.years_car || carData.รถปี || "";
    const carId = carData.id;

    // Create a slug from brand, model, year
    const createSlug = (text) => {
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\-\+\/\\]+/g, "-") // Replace spaces, hyphens, plus, slashes with single hyphen
        .replace(/[^\w\-\u0E00-\u0E7F]+/g, "") // Remove non-word chars except Thai characters and hyphens
        .replace(/\-\-+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-+/, "") // Trim hyphens from start
        .replace(/-+$/, ""); // Trim hyphens from end
    };

    // Build URL slug
    const brandSlug = createSlug(brand);
    const modelSlug = createSlug(model);
    const yearSlug = year.toString();

    // Combine parts
    const urlParts = [brandSlug, modelSlug, yearSlug, carId].filter(
      (part) => part
    );
    const slug = urlParts.join("-");

    return `/cars/${slug}`;
  },

  // ✅ Generate full URL with domain
  generateFullCarDetailUrl: (carData) => {
    const relativePath = urlUtils.generateCarDetailUrl(carData);
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "https://crm.ckc2car.com";

    return `${baseUrl}${relativePath}`;
  },
};
