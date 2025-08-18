import { NextResponse } from "next/server";
import { cache } from "react";
import { fetchData } from "@/app/services/supabase/query";
import { handleApiError } from "@/app/libs/apiHelpers";

// 🎯 FLEXIBLE CACHED DATA FETCHER
const getCachedReferenceData = cache(
  async (includeTypes = ["models", "branches", "types"]) => {
    console.log(
      `[Cars Reference API] Fetching data for: ${includeTypes.join(", ")}`
    );

    // Prepare promises based on what's requested
    const promises = [];
    const dataKeys = [];

    if (includeTypes.includes("models")) {
      promises.push(fetchData("car_model", { select: "title" }));
      dataKeys.push("models");
    }

    if (includeTypes.includes("branches")) {
      promises.push(fetchData("branch", { select: "title" }));
      dataKeys.push("branches");
    }

    if (includeTypes.includes("types")) {
      promises.push(fetchData("car_type", { select: "title,id" }));
      dataKeys.push("types");
    }

    // Execute requested queries in parallel
    const results = await Promise.allSettled(promises);

    // Process results
    const data = {
      carModels: [],
      branches: [],
      carTypes: [],
      lastFetched: new Date().toISOString(),
      errors: [],
      requestedTypes: includeTypes,
    };

    results.forEach((result, index) => {
      const key = dataKeys[index];

      if (result.status === "fulfilled" && result.value.success) {
        switch (key) {
          case "models":
            data.carModels = result.value.data?.map((item) => item.title) || [];
            break;
          case "branches":
            data.branches = result.value.data?.map((item) => item.title) || [];
            break;
          case "types":
            data.carTypes = result.value.data || [];
            break;
        }
      } else {
        data.errors.push({
          type: key,
          error:
            result.reason?.message || result.value?.error || "Unknown error",
        });
      }
    });

    console.log(
      `[Cars Reference API] Fetched: ${data.carModels.length} models, ${data.branches.length} branches, ${data.carTypes.length} types`
    );

    return data;
  }
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "detailed";
    const cache = searchParams.get("cache") !== "false";

    // 🎯 PARSE INCLUDE PARAMETER
    const includeParam = searchParams.get("include");
    const includeTypes = includeParam
      ? includeParam.split(",").map((type) => type.trim())
      : ["models", "branches", "types"]; // Default: all types

    // Validate include types
    const validTypes = ["models", "branches", "types"];
    const invalidTypes = includeTypes.filter(
      (type) => !validTypes.includes(type)
    );

    if (invalidTypes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid include types: ${invalidTypes.join(
            ", "
          )}. Valid types: ${validTypes.join(", ")}`,
          code: "INVALID_INCLUDE_TYPES",
        },
        { status: 400 }
      );
    }

    console.log(
      `[Cars Reference API] Request (format: ${format}, cache: ${cache}, include: ${includeTypes.join(
        ", "
      )})`
    );

    // 🎯 GET CACHED DATA based on requested types
    const cachedData = await getCachedReferenceData(includeTypes);

    // Format response based on request
    const data = {};

    // Only include requested data types
    if (includeTypes.includes("models")) {
      data.carModels = cachedData.carModels;
    }
    if (includeTypes.includes("branches")) {
      data.branches = cachedData.branches;
    }
    if (includeTypes.includes("types")) {
      data.carTypes = cachedData.carTypes;
    }

    if (format === "detailed") {
      data.metadata = {
        lastUpdated: cachedData.lastFetched,
        requestedTypes: includeTypes,
        totalModels: cachedData.carModels.length,
        totalBranches: cachedData.branches.length,
        totalTypes: cachedData.carTypes.length,
        errors: cachedData.errors.length > 0 ? cachedData.errors : undefined,
        cacheEnabled: cache,
        cached: true,
      };
    }

    // Add HTTP cache headers for browser/CDN caching
    const headers = cache
      ? {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
          ETag: `"reference-${includeTypes.join("-")}-${Date.now()}"`,
          "X-Cache-Status": "HIT",
          "X-Include-Types": includeTypes.join(","), // Debug header
        }
      : {
          "Cache-Control": "no-cache",
          "X-Cache-Status": "BYPASS",
        };

    return NextResponse.json(
      {
        success: true,
        data,
        message: `Reference data fetched successfully for: ${includeTypes.join(
          ", "
        )}`,
      },
      { headers }
    );
  } catch (error) {
    console.error("[Cars Reference API] Error:", error);
    return handleApiError(error);
  }
}
