import { NextResponse } from "next/server";
import { parseUrlToQueryObject } from "@/app/utils/parseUrlToQuery";
import { fetchData } from "@/app/services/supabase/query";

// ✅ Configuration based on your database structure
const SEARCH_CONFIG = {
  DEFAULT_PAGE_SIZE: 6,
  MAX_PAGE_SIZE: 50,
  MIN_PAGE_SIZE: 1,
  DEFAULT_PAGE: 1,
  CACHE_TTL: 300, // 5 minutes
  MAX_SEARCH_LENGTH: 100,

  // ✅ Your actual database schema
  DATABASE: {
    TABLE: "cars_full_view",
    COLUMNS: {
      CREATED: "created",
      UPDATED: "updated",
      PRICE: "price",
      ID: "id",
      NO_CAR: "no_car",
      TITLE: "title",
      BRAND_NAME: "brand_name",
      MODEL_NAME: "model_name",
      CAR_TYPE_TITLE: "car_type_title",
      YEARS_CAR: "years_car",
      USED_MILE: "used_mile",
      COLOR: "color",
      FUEL_TYPE: "fuel_type",
      GEAR: "gear",
      STATUS: "status",
      BRANCH_NAME: "branch_name",
      CAR_STATUS: "car_status",
      VIEWS: "views",
      IMAGE_PATH: "image_path",
      THUMBNAIL: "thumbnail",
      PUBLIC_URL: "public_url",
    },
  },
};

// ✅ Enhanced validation for your data structure
const validateSearchParams = (queryObject) => {
  const errors = [];

  // Validate page
  if (queryObject.page !== undefined) {
    const page = parseInt(queryObject.page);
    if (isNaN(page) || page < 1) {
      errors.push("Page must be a positive integer");
    }
    queryObject.page = page;
  }

  // Validate pageSize
  if (queryObject.pageSize !== undefined) {
    const pageSize = parseInt(queryObject.pageSize);
    if (
      isNaN(pageSize) ||
      pageSize < SEARCH_CONFIG.MIN_PAGE_SIZE ||
      pageSize > SEARCH_CONFIG.MAX_PAGE_SIZE
    ) {
      errors.push(
        `Page size must be between ${SEARCH_CONFIG.MIN_PAGE_SIZE} and ${SEARCH_CONFIG.MAX_PAGE_SIZE}`
      );
    }
    queryObject.pageSize = pageSize;
  }

  // ✅ Validate price filters
  if (queryObject.lte?.price !== undefined) {
    const price = parseFloat(queryObject.lte.price);
    if (isNaN(price) || price < 0) {
      errors.push("Maximum price must be a non-negative number");
    }
    queryObject.lte.price = price;
  }

  if (queryObject.gte?.price !== undefined) {
    const price = parseFloat(queryObject.gte.price);
    if (isNaN(price) || price < 0) {
      errors.push("Minimum price must be a non-negative number");
    }
    queryObject.gte.price = price;
  }

  // ✅ Validate year filters
  if (queryObject.lte?.years_car !== undefined) {
    const year = parseInt(queryObject.lte.years_car);
    if (isNaN(year) || year < 1950 || year > new Date().getFullYear() + 1) {
      errors.push("Maximum year must be a valid year");
    }
    queryObject.lte.years_car = year;
  }

  if (queryObject.gte?.years_car !== undefined) {
    const year = parseInt(queryObject.gte.years_car);
    if (isNaN(year) || year < 1950 || year > new Date().getFullYear() + 1) {
      errors.push("Minimum year must be a valid year");
    }
    queryObject.gte.years_car = year;
  }

  // ✅ Validate mileage filters
  if (queryObject.lte?.used_mile !== undefined) {
    const mile = parseInt(queryObject.lte.used_mile);
    if (isNaN(mile) || mile < 0) {
      errors.push("Maximum mileage must be a non-negative number");
    }
    queryObject.lte.used_mile = mile;
  }

  if (queryObject.gte?.used_mile !== undefined) {
    const mile = parseInt(queryObject.gte.used_mile);
    if (isNaN(mile) || mile < 0) {
      errors.push("Minimum mileage must be a non-negative number");
    }
    queryObject.gte.used_mile = mile;
  }

  // ✅ Validate search terms
  if (queryObject.search && Array.isArray(queryObject.search)) {
    queryObject.search = queryObject.search.filter((searchTerm) => {
      if (
        typeof searchTerm.query === "string" &&
        searchTerm.query.length > SEARCH_CONFIG.MAX_SEARCH_LENGTH
      ) {
        errors.push(
          `Search term too long (max ${SEARCH_CONFIG.MAX_SEARCH_LENGTH} characters)`
        );
        return false;
      }
      return true;
    });
  }

  return { isValid: errors.length === 0, errors, cleanedQuery: queryObject };
};

// ✅ Enhanced response formatter with proper image URLs
const formatSearchResponse = (
  result,
  queryObject,
  fromSource,
  requestId,
  startTime
) => {
  const endTime = Date.now();
  const executionTime = endTime - startTime;

  const page = queryObject.page || SEARCH_CONFIG.DEFAULT_PAGE;
  const pageSize = queryObject.pageSize || SEARCH_CONFIG.DEFAULT_PAGE_SIZE;
  const totalCount = result.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  // ✅ Helper function to construct image URLs
  const constructImageUrl = (imagePath) => {
    const baseImageUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

    if (!imagePath) return null;

    // If the image path already starts with http/https, return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // If no base URL is configured, return the path as is
    if (!baseImageUrl) {
      return imagePath;
    }

    // Ensure the path starts with /
    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    // Combine base URL with image path
    return `${baseImageUrl}${normalizedPath}`;
  };

  // ✅ Format each car with enhanced metadata and proper image URLs
  const formattedData = (result.data || []).map((car, index) => {
    // Parse images JSON if it's a string
    let parsedImages = [];
    try {
      if (car.images && typeof car.images === "string") {
        parsedImages = JSON.parse(car.images);
      } else if (Array.isArray(car.images)) {
        parsedImages = car.images;
      }
    } catch (e) {
      console.warn("Failed to parse images for car:", car.id);
    }

    // Parse insurance data if it's a string
    let parsedInsche = {};
    try {
      if (car.insche && typeof car.insche === "string") {
        parsedInsche = JSON.parse(car.insche);
      } else if (typeof car.insche === "object") {
        parsedInsche = car.insche || {};
      }
    } catch (e) {
      console.warn("Failed to parse insurance data for car:", car.id);
    }

    // ✅ Determine main image with proper URL construction
    const mainImage =
      car.image_path ||
      car.thumbnail ||
      (parsedImages[0]
        ? `/uploads/posts/thumbnail/${parsedImages[0].image}`
        : null);

    return {
      ...car,
      // ✅ Parsed JSON fields
      images: parsedImages,
      insche: parsedInsche,

      // ✅ Enhanced metadata with proper image URLs
      _metadata: {
        rank: (page - 1) * pageSize + index + 1,
        page,
        fromAI: fromSource === "ai",
        formatted_price: parseInt(car.price || 0).toLocaleString("th-TH"),
        formatted_mileage: parseInt(car.used_mile || 0).toLocaleString("th-TH"),
        car_age: new Date().getFullYear() - (parseInt(car.years_car) || 0),
        full_title: `${car.brand_name} ${car.model_name} ${car.title}`.trim(),
        main_image: constructImageUrl(mainImage), // ✅ Proper image URL
        image_count: parsedImages.length,
        view_count: parseInt(car.views || 0),
        has_youtube: !!car.youtube,
        promotion: car.marker || null,
        features: car.featured || null,
      },
    };
  });

  return {
    success: true,
    data: formattedData,
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
      itemsOnPage: formattedData.length,
    },
    search: {
      query: queryObject,
      fromSource,
      appliedFilters: extractAppliedFilters(queryObject),
      sortBy: queryObject.sort || [
        SEARCH_CONFIG.DATABASE.COLUMNS.CREATED,
        "desc",
      ],
    },
    metadata: {
      requestId,
      timestamp: new Date().toISOString(),
      executionTime: `${executionTime}ms`,
      cached: false,
      version: "2.0",
      table: SEARCH_CONFIG.DATABASE.TABLE,
      baseImageUrl: process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "Not configured",
    },
  };
};

// ✅ Enhanced filter extraction
const extractAppliedFilters = (queryObject) => {
  const filters = [];

  // Price filters
  if (queryObject.lte?.price) {
    filters.push({
      type: "price_max",
      label: `ราคาสูงสุด ≤ ${parseInt(queryObject.lte.price).toLocaleString(
        "th-TH"
      )} บาท`,
      value: queryObject.lte.price,
    });
  }

  if (queryObject.gte?.price) {
    filters.push({
      type: "price_min",
      label: `ราคาต่ำสุด ≥ ${parseInt(queryObject.gte.price).toLocaleString(
        "th-TH"
      )} บาท`,
      value: queryObject.gte.price,
    });
  }

  // Year filters
  if (queryObject.lte?.years_car) {
    filters.push({
      type: "year_max",
      label: `ปีสูงสุด ≤ ${queryObject.lte.years_car}`,
      value: queryObject.lte.years_car,
    });
  }

  if (queryObject.gte?.years_car) {
    filters.push({
      type: "year_min",
      label: `ปีต่ำสุด ≥ ${queryObject.gte.years_car}`,
      value: queryObject.gte.years_car,
    });
  }

  // Mileage filters
  if (queryObject.lte?.used_mile) {
    filters.push({
      type: "mile_max",
      label: `เลขไมล์สูงสุด ≤ ${parseInt(
        queryObject.lte.used_mile
      ).toLocaleString("th-TH")} กม.`,
      value: queryObject.lte.used_mile,
    });
  }

  if (queryObject.gte?.used_mile) {
    filters.push({
      type: "mile_min",
      label: `เลขไมล์ต่ำสุด ≥ ${parseInt(
        queryObject.gte.used_mile
      ).toLocaleString("th-TH")} กม.`,
      value: queryObject.gte.used_mile,
    });
  }

  // Search terms
  if (queryObject.search && Array.isArray(queryObject.search)) {
    queryObject.search.forEach((searchTerm) => {
      filters.push({
        type: "search",
        label: `ค้นหา: "${searchTerm.query}" ใน ${getColumnDisplayName(
          searchTerm.column
        )}`,
        value: searchTerm.query,
        column: searchTerm.column,
      });
    });
  }

  // Category filters
  if (queryObject.filters) {
    Object.entries(queryObject.filters).forEach(([key, value]) => {
      const displayName = getColumnDisplayName(key);
      const displayValue = Array.isArray(value) ? value.join(", ") : value;
      filters.push({
        type: "filter",
        label: `${displayName}: ${displayValue}`,
        field: key,
        value,
      });
    });
  }

  return filters;
};

// ✅ Helper function for user-friendly column names
const getColumnDisplayName = (column) => {
  const columnMap = {
    no_car: "รหัสรถ",
    title: "รุ่น",
    brand_name: "ยี่ห้อ",
    model_name: "รุ่น",
    car_type_title: "ประเภทรถ",
    price: "ราคา",
    years_car: "ปี",
    used_mile: "เลขไมล์",
    color: "สี",
    fuel_type: "ประเภทเชื้อเพลิง",
    gear: "เกียร์",
    branch_name: "สาขา",
    created: "วันที่เพิ่ม",
    updated: "วันที่แก้ไข",
    car_status: "สถานะรถ",
    key_word: "คำค้นหา",
  };
  return columnMap[column] || column;
};

// ✅ Main GET handler
export async function GET(request) {
  const startTime = Date.now();
  const requestId = `search_${startTime}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  try {
    console.log(`[Cars Search API] Request ${requestId} started`);

    const { searchParams } = new URL(request.url);
    const fromSource = searchParams.get("from") || "web";

    // Parse query object from URL parameters
    const rawQueryObject = parseUrlToQueryObject(searchParams);

    console.log(`[Cars Search API] Raw params:`, rawQueryObject);

    if (!rawQueryObject) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or missing query parameters",
          code: "INVALID_QUERY_PARAMS",
          requestId,
        },
        { status: 400 }
      );
    }

    // Validate and clean the query object
    const validation = validateSearchParams({ ...rawQueryObject });

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validation.errors,
          code: "VALIDATION_ERROR",
          requestId,
        },
        { status: 400 }
      );
    }

    const queryObject = validation.cleanedQuery;

    // Apply defaults
    queryObject.page = queryObject.page || SEARCH_CONFIG.DEFAULT_PAGE;
    queryObject.pageSize =
      queryObject.pageSize || SEARCH_CONFIG.DEFAULT_PAGE_SIZE;
    queryObject.total = { count: "exact" };

    // ✅ Add default sorting with correct column name
    if (!queryObject.sort) {
      queryObject.sort = [SEARCH_CONFIG.DATABASE.COLUMNS.CREATED, "desc"];
    }

    console.log(`[Cars Search API] Final params:`, queryObject);

    // Execute the database query
    const result = await fetchData(SEARCH_CONFIG.DATABASE.TABLE, queryObject);

    if (!result.success) {
      console.error(`[Cars Search API] Database error:`, result.message);
      return NextResponse.json(
        {
          success: false,
          error: "Database query failed",
          details: result.message,
          code: "DATABASE_ERROR",
          requestId,
        },
        { status: 500 }
      );
    }

    // Format and return the response
    const response = formatSearchResponse(
      result,
      queryObject,
      fromSource,
      requestId,
      startTime
    );

    console.log(`[Cars Search API] Request ${requestId} completed:`, {
      success: response.success,
      itemCount: response.data.length,
      totalCount: response.pagination.totalCount,
      executionTime: response.metadata.executionTime,
      fromSource,
    });

    // Set cache headers
    const cacheHeaders = {
      "Cache-Control": `public, max-age=${SEARCH_CONFIG.CACHE_TTL}, stale-while-revalidate=600`,
      ETag: `"${requestId}"`,
      Vary: "Accept, Accept-Encoding",
    };

    return NextResponse.json(response, {
      status: 200,
      headers: cacheHeaders,
    });
  } catch (error) {
    console.error(`[Cars Search API] Request ${requestId} failed:`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
        code: "INTERNAL_ERROR",
        requestId,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// ✅ POST method for complex search queries
export async function POST(request) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const fromSource = searchParams.get("from") || "web";

    // Convert POST body to GET-style parameters and reuse the GET logic
    const fakeSearchParams = new URLSearchParams();
    fakeSearchParams.set("q", encodeURIComponent(JSON.stringify(body)));
    if (fromSource) fakeSearchParams.set("from", fromSource);

    // Create a new request object that mimics a GET request
    const getRequest = new Request(
      `${request.url.split("?")[0]}?${fakeSearchParams.toString()}`,
      { method: "GET" }
    );

    return GET(getRequest);
  } catch (error) {
    console.error("[Cars Search API] POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        code: "INVALID_POST_BODY",
      },
      { status: 400 }
    );
  }
}
