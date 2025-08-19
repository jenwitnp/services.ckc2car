"use client";

import React from "react";

export default function InfiniteScrollGrid({
  items = [],
  renderItem,
  observerRef,
  isLoading,
  isError,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  totalCount = 0,
  emptyMessage = "ไม่พบข้อมูล",
  columns = 3,
  className = "",
}) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-main-500"></div>
        <p className="ml-4">กำลังโหลด...</p>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-danger-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-danger-800">
              เกิดข้อผิดพลาด
            </h3>
            <p className="mt-1 text-sm text-danger-700">
              {error?.message || "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-12 w-12 text-main-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-main-100">
          {emptyMessage}
        </h3>
      </div>
    );
  }

  // ✅ Add debug logging and check for duplicates
  const itemIds = items.map((item) => item.id);
  const duplicateIds = itemIds.filter(
    (id, index) => itemIds.indexOf(id) !== index
  );

  if (duplicateIds.length > 0) {
    console.warn("[InfiniteScrollGrid] Duplicate IDs found:", duplicateIds);
  }

  console.log("[InfiniteScrollGrid] Render state:", {
    itemsCount: items.length,
    totalCount,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    duplicateIds: duplicateIds.length,
  });

  // ✅ Create unique keys by combining ID with index to prevent duplicates
  const generateUniqueKey = (item, index) => {
    // Use both ID and index to ensure uniqueness
    return `${item.id || "no-id"}-${index}`;
  };

  // Show grid with items
  return (
    <div className="space-y-6">
      {/* Header with count */}
      <div className="sticky top-0 z-10 py-3 px-4 -mx-4 backdrop-blur-md bg-main-900/80 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl text-main-200 font-bold">
            พบ {totalCount.toLocaleString("th-TH")} รายการ
          </h1>
          <div className="text-sm text-main-500">
            แสดง {items.length} จาก {totalCount} รายการ
          </div>
        </div>
      </div>

      {/* Item grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6 ${className}`}
      >
        {items.map((item, index) => {
          // ✅ Generate unique key
          const uniqueKey = generateUniqueKey(item, index);

          return (
            <div
              key={uniqueKey} // ✅ Use unique key
              className="animate-fadeIn"
              style={{
                animationDelay: `${Math.min(index * 0.05, 1)}s`,
                opacity: 0,
                animation: "fadeIn 0.5s ease forwards",
              }}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>

      {/* ✅ Enhanced observer target with better visibility */}
      <div className="w-full py-8 flex justify-center items-center min-h-[100px]">
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main-500"></div>
            <p className="mt-2 text-sm text-main-400">
              กำลังโหลดข้อมูลเพิ่มเติม...
            </p>
          </div>
        ) : hasNextPage ? (
          <div className="flex flex-col items-center w-full">
            {/* ✅ Intersection observer target - separate from button */}
            <div
              ref={observerRef}
              className="w-full h-20 flex items-center justify-center"
              style={{
                // ✅ Make it more visible for debugging
                backgroundColor:
                  process.env.NODE_ENV === "development"
                    ? "rgba(255,0,0,0.1)"
                    : "transparent",
                border:
                  process.env.NODE_ENV === "development"
                    ? "2px dashed danger"
                    : "none",
              }}
            >
              {process.env.NODE_ENV === "development" && (
                <span className="text-xs text-danger-500">Observer Target</span>
              )}
            </div>

            {/* Manual load button */}
            <button
              onClick={() => {
                console.log("[InfiniteScrollGrid] Manual fetch triggedanger");
                fetchNextPage();
              }}
              className="px-6 py-2 bg-main-700 text-main-100 rounded-full hover:bg-main-600 transition-colors"
            >
              โหลดข้อมูลเพิ่มเติม
            </button>
          </div>
        ) : (
          <p className="text-sm text-main-400 py-2">แสดงข้อมูลครบแล้ว</p>
        )}
      </div>
    </div>
  );
}
