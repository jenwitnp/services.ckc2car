"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseUrlToQueryObject } from "@/app/utils/parseUrlToQuery";

// Separate component that uses useSearchParams
function CarsPageContent() {
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
        `/api/v1/cars/search?${searchParams.toString()}`
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
    const nextPageUrl = `/api/v1/cars/search?q=${queryParam}${sourceParam}`;
    queryClient.prefetchQuery(["cars", nextPageUrl], async () => {
      const res = await fetch(nextPageUrl);
      return res.json();
    });

    // Navigate to the new page
    router.push(`/cars/search?q=${queryParam}${sourceParam}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลรถยนต์...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">เกิดข้อผิดพลาด</div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">รถยนต์ทั้งหมด</h1>

      {data && (
        <div className="space-y-6">
          {/* Results Info */}
          <div className="text-gray-600">
            พบรถยนต์ {data.pagination?.totalCount || 0} คัน
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data?.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  {car.thumbnail && (
                    <img
                      src={car.thumbnail}
                      alt={car.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {car.title}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    ฿{car.price?.toLocaleString()}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>ปี: {car.years_car}</div>
                    <div>เกียร์: {car.gear}</div>
                    <div>เชื้อเพลิง: {car.fuel_type}</div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/cars/${car.public_url || car.id}`}
                      className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from(
                { length: data.pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded ${
                    page === data.pagination.page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component with Suspense wrapper
export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดหน้ารถยนต์...</p>
          </div>
        </div>
      }
    >
      <CarsPageContent />
    </Suspense>
  );
}
