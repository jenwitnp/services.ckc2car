"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseUrlToQueryObject } from "@/app/utils/parseUrlToQuery"; // Make sure you have this utility

export default function CarsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  // Parse query from URL
  const parsedQuery = React.useMemo(() => {
    return parseUrlToQueryObject(searchParams);
  }, [searchParams]);

  console.log("query parse", parsedQuery);

  // Create a query key that includes all search parameters
  const queryKey = ["cars", searchParams.toString()];

  // Fetch cars data using React Query
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        `/api/cars/search?${searchParams.toString()}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch car data");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true, // Keep previous data while loading new data
  });

  // Handle pagination with prefetching for smoother transitions
  const handlePageChange = (newPage) => {
    if (!parsedQuery) return;

    // Create a copy of the query with the new page
    const updatedQuery = {
      ...parsedQuery,
      page: newPage,
    };

    // Encode the query object
    const queryParam = encodeURIComponent(JSON.stringify(updatedQuery));

    // Get the source parameter if it exists
    const source = searchParams.get("from") || "";
    const sourceParam = source ? `&from=${source}` : "";

    // Prefetch the next page data
    const nextPageUrl = `/api/cars/search?q=${queryParam}${sourceParam}`;
    queryClient.prefetchQuery(["cars", nextPageUrl], async () => {
      const res = await fetch(nextPageUrl);
      return res.json();
    });

    // Navigate to the new page
    router.push(`/car/search?q=${queryParam}${sourceParam}`);
    setCurrentPage(newPage);
  };

  // Extract query and results from data
  const query = data?.query || parsedQuery;
  const results = data?.data || [];
  const count = data?.count || 0;

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
        </div>
        <p className="text-center mt-4">กำลังโหลดข้อมูลรถยนต์...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
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
              <h3 className="text-sm font-medium text-red-800">
                เกิดข้อผิดพลาด
              </h3>
              <p className="mt-1 text-sm text-red-700">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (count === 0) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center py-16">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            ไม่พบข้อมูลรถ
          </h3>
          <p className="mt-1 text-gray-500">
            ไม่พบรถยนต์ที่ตรงตามเงื่อนไขการค้นหา
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show results
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">พบรถ {count} คัน</h1>
        <div className="text-sm text-gray-500">
          หน้า {currentPage} จาก {Math.ceil(count / (query?.pageSize || 20))}
        </div>
      </div>

      {/* Cars grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((car) => (
          <div
            key={car.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:translate-y-[-5px] hover:shadow-lg"
          >
            {/* Car image */}
            <div className="h-48 bg-gray-200 relative">
              {car.youtube && (
                <a
                  href={car.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs flex items-center hover:bg-red-700 transition-colors"
                >
                  <svg
                    className="w-3 h-3 mr-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                  </svg>
                  <span>ดูวิดีโอ</span>
                </a>
              )}
            </div>

            <div className="p-4">
              <h2 className="text-lg font-semibold">
                {car.ยี่ห้อ} {car.รุ่น} ({car.รถปี})
              </h2>
              <p className="text-gray-600">{car.ชื่อสินค้า}</p>
              <div className="flex items-center mt-2">
                <span className="text-gray-500">สี{car.สี}</span>
                <span className="mx-2">•</span>
                <span className="text-gray-500">เกียร์{car.เกียร์}</span>
              </div>
              <div className="mt-4">
                <span className="text-xl font-bold text-green-600">
                  {parseInt(car.ราคา).toLocaleString()} บาท
                </span>
                {car.ผ่อน && (
                  <span className="ml-2 text-sm text-gray-500">
                    ผ่อน {parseInt(car.ผ่อน).toLocaleString()} บาท/เดือน
                  </span>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <span className="text-sm text-gray-500">รหัส {car.รหัสรถ}</span>
                <span className="text-sm text-gray-500">{car.สาขา}</span>
              </div>
            </div>

            <a
              href={car.url}
              className="block bg-green-600 text-white text-center py-2 hover:bg-green-700 transition-colors"
            >
              ดูรายละเอียด
            </a>
          </div>
        ))}
      </div>

      {/* Pagination with React Query */}
      {count > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`mr-2 px-3 py-1 rounded ${
                currentPage <= 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              &laquo; ก่อนหน้า
            </button>

            {Array.from(
              {
                length: Math.min(5, Math.ceil(count / (query?.pageSize || 20))),
              },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={
                currentPage >= Math.ceil(count / (query?.pageSize || 20))
              }
              className={`ml-2 px-3 py-1 rounded ${
                currentPage >= Math.ceil(count / (query?.pageSize || 20))
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              ถัดไป &raquo;
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
