"use client";

import { useQuery } from "@tanstack/react-query";

export function useCarDetail(carId, options = {}) {
  const { includeRelated = false, enabled = true } = options;

  const query = useQuery({
    queryKey: ["car-detail", carId],
    queryFn: async () => {
      console.log(`[useCarDetail] Fetching car ${carId}`);

      // ✅ Simple direct API call
      const url = `/api/v1/cars/${carId}${
        includeRelated ? "?include_related=true" : ""
      }`;
      console.log(`[useCarDetail] URL: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch car details`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch car details");
      }

      return result;
    },
    enabled: enabled && !!carId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404
      if (error?.message?.includes("404")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    car: query.data?.data,
    relatedCars: query.data?.relatedCars || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
