"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import useInfiniteData from "@/app/hooks/useInfiniteData";

import CarCard from "@/app/components/cars/CarCard";
import FailMessage from "@/app/components/ui/FailMessage";
import { parseUrlToQueryObject } from "@/app/utils/parseUrlToQuery";
import InfiniteScrollGrid from "@/app/components/grid/InfiniteScrollGrid";

// ✅ Enhanced Search Stats Component with your data
const SearchStats = ({ searchData, fromAI }) => {
  if (!searchData) return null;

  const { pagination, search } = searchData;
  const appliedFilters = search?.appliedFilters || [];

  return (
    <div className="space-y-4">
      {/* AI Source Banner */}
      {fromAI && (
        <div className="bg-success-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-main-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-main-300">
                🤖 ผลการค้นหาจาก CKC2Car AI
              </h3>
              <p className="mt-1 text-sm text-success-200">
                ผลลัพธ์ที่ AI แนะนำโดยใช้ CarContextService
                และการเรียนรู้แบบอัจฉริยะ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Summary */}
      <div className="bg-main-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-main-100">
              ผลการค้นหา: {pagination.totalCount.toLocaleString("th-TH")} รายการ
            </h2>
            <p className="text-sm text-main-400">
              แสดงหน้า {pagination.page} จาก {pagination.totalPages} หน้า
              {pagination.itemsOnPage &&
                ` (${pagination.itemsOnPage} รายการในหน้านี้)`}
            </p>
          </div>
          {/* Sort indicator */}
          {search?.sortBy && (
            <div className="text-xs text-main-400">
              เรียงตาม: {formatSortDisplay(search.sortBy)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Helper function to format sort display
const formatSortDisplay = (sortBy) => {
  if (!sortBy || !Array.isArray(sortBy)) return null;

  const [column, direction] = sortBy;

  const columnLabels = {
    created: "วันที่เพิ่ม",
    updated: "วันที่แก้ไข",
    price: "ราคา",
    used_mile: "เลขไมล์",
    years_car: "ปี",
    views: "ความนิยม",
    relevance: "ความเกี่ยวข้อง",
  };

  const label = columnLabels[column] || column;
  const directionText = direction === "asc" ? "น้อยไปมาก" : "มากไปน้อย";

  return `${label} (${directionText})`;
};

// ✅ Error Boundary Component
const SearchErrorBoundary = ({ children, error, retry }) => {
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="bg-danger-100 border border-danger-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-danger-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-danger-800">
                เกิดข้อผิดพลาดในการค้นหา
              </h3>
              <p className="mt-2 text-sm text-danger-700">{error.message}</p>
              <div className="mt-4">
                <button
                  onClick={retry}
                  className="bg-danger-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-danger-700 transition-colors"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// ✅ Main Search Page Component
function CarSearchPageContent() {
  const searchParams = useSearchParams();
  const [searchMetadata, setSearchMetadata] = useState(null);

  // Parse query from URL
  const parsedQuery = React.useMemo(() => {
    const result = parseUrlToQueryObject(searchParams);
    console.log("[CarSearchPage] Parsed query:", result);
    return result;
  }, [searchParams]);

  // Get source information
  const fromAI = searchParams.get("from") === "ai";

  // Custom function to transform the parsed query into URL params
  const getQueryParams = React.useCallback(
    (params) => {
      const queryParam = encodeURIComponent(JSON.stringify(params));
      const source = searchParams.get("from") || "";
      const sourceParam = source ? `&from=${source}` : "";
      return `q=${queryParam}${sourceParam}`;
    },
    [searchParams]
  );

  // ✅ Use the correct API route
  const {
    allItems: cars,
    totalCount,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    observerRef,
    refetch,
    data,
  } = useInfiniteData({
    queryKey: ["cars", fromAI ? "ai" : "web"],
    apiRoute: "/api/v1/cars/search", // ✅ Use the new enhanced search route
    initialParams: parsedQuery || {},
    getQueryParams,
    enabled: !!parsedQuery,
  });

  // Extract metadata from the first page
  useEffect(() => {
    if (data?.pages?.[0]) {
      setSearchMetadata(data.pages[0]);
    }
  }, [data]);

  // Show error if no valid query
  if (!parsedQuery) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4">
        <FailMessage
          message="ขออภัย ไม่พบข้อมูลการค้นหาที่ถูกต้อง"
          className="py-20"
        />
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-success-600 hover:bg-success-700 transition-colors"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SearchErrorBoundary error={isError ? error : null} retry={refetch}>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Search Statistics */}
        <SearchStats searchData={searchMetadata} fromAI={fromAI} />

        {/* Cars Grid */}
        <div className="mt-8">
          <InfiniteScrollGrid
            items={cars}
            renderItem={(car, index) => (
              <CarCard
                car={car}
                showRank={fromAI}
                rank={car._metadata?.rank}
                fromAI={fromAI}
              />
            )}
            observerRef={observerRef}
            isLoading={isLoading}
            isError={isError}
            error={error}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            totalCount={totalCount}
            emptyMessage="ไม่พบรถยนต์ที่ตรงตามเงื่อนไขการค้นหา"
            columns={3}
          />
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === "development" && searchMetadata && (
          <div className="mt-8 p-4 bg-main-800 rounded-lg">
            <details className="text-main-200">
              <summary className="cursor-pointer font-medium">
                🔍 Debug Information
              </summary>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(searchMetadata, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </SearchErrorBoundary>
  );
}

// ✅ Main component with Suspense wrapper
export default function CarSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto py-16 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-success-500"></div>
            <p className="ml-4 text-main-200">กำลังโหลดผลการค้นหา...</p>
          </div>
        </div>
      }
    >
      <CarSearchPageContent />
    </Suspense>
  );
}
