"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRef, useEffect, useCallback, useMemo } from "react";

export const ITEMS_PER_PAGE = 6;

export default function useInfiniteData({
  queryKey,
  apiRoute,
  initialParams = {},
  pageSize = ITEMS_PER_PAGE,
  getQueryParams = defaultGetQueryParams,
  enabled = true,
}) {
  const observerRef = useRef(null);

  const query = useInfiniteQuery({
    queryKey: [queryKey, JSON.stringify(initialParams)],
    queryFn: async ({ pageParam = 1 }) => {
      const pageParams = {
        ...initialParams,
        page: pageParam,
        pageSize,
      };

      const queryString = getQueryParams(pageParams);
      const response = await fetch(`${apiRoute}?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch ${queryKey}`);
      }

      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      // ✅ Fix: Access pagination data correctly
      const totalItems = lastPage.pagination?.totalCount || lastPage.count || 0;
      const currentPage = lastPage.pagination?.page || allPages.length;
      const totalPages =
        lastPage.pagination?.totalPages || Math.ceil(totalItems / pageSize);

      console.log("[useInfiniteData] Page info:", {
        currentPage,
        totalPages,
        totalItems,
        hasNextPage: lastPage.pagination?.hasNextPage,
        itemsInThisPage: lastPage.data?.length || 0,
      });

      // Check if we have more pages
      if (currentPage >= totalPages || !lastPage.pagination?.hasNextPage) {
        console.log("[useInfiniteData] No more pages available");
        return undefined;
      }

      // ✅ Return next page number
      const nextPage = currentPage + 1;
      console.log("[useInfiniteData] Next page:", nextPage);
      return nextPage;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    // ✅ Add refetchOnWindowFocus to prevent duplicate fetches
    refetchOnWindowFocus: false,
    // ✅ Add retry config
    retry: 1,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = query;

  // ✅ Enhanced intersection observer with debouncing
  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      console.log("[useInfiniteData] Observer triggered:", {
        isIntersecting: entry?.isIntersecting,
        hasNextPage,
        isFetchingNextPage,
        intersectionRatio: entry?.intersectionRatio,
      });

      // ✅ Only trigger if we're actually intersecting and not already fetching
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        console.log("[useInfiniteData] Fetching next page...");
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "0px 0px 200px 0px", // Trigger 200px before reaching the element
      threshold: 0.1,
    });

    const currentRef = observerRef.current;
    if (currentRef) {
      console.log("[useInfiniteData] Observer attached to element");
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [handleObserver]);

  // ✅ Fix: Access nested data correctly and remove duplicates
  const allItems = useMemo(() => {
    const items = data?.pages.flatMap((page) => page.data || []) || [];

    // ✅ Remove duplicates based on ID
    const uniqueItems = items.filter(
      (item, index, self) => index === self.findIndex((i) => i.id === item.id)
    );

    if (items.length !== uniqueItems.length) {
      console.warn("[useInfiniteData] Removed duplicates:", {
        original: items.length,
        unique: uniqueItems.length,
        duplicates: items.length - uniqueItems.length,
      });
    }

    return uniqueItems;
  }, [data?.pages]);

  const totalCount =
    data?.pages[0]?.pagination?.totalCount || data?.pages[0]?.count || 0;

  return {
    ...query,
    allItems,
    totalCount,
    observerRef,
  };
}

function defaultGetQueryParams(params) {
  return new URLSearchParams(Object.entries(params)).toString();
}
