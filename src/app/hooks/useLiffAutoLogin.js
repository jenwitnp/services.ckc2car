"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useLiffAutoLogin() {
  const [isLiffApp, setIsLiffApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        const currentPath = window.location.pathname + window.location.search;

        console.log("[LIFF] Current path:", currentPath);

        // ✅ Check if we're in LIFF environment
        if (typeof window !== "undefined" && window.liff) {
          console.log("[LIFF] LIFF environment detected");

          try {
            await window.liff.init({
              liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID,
            });
            setIsLiffApp(true);
            console.log("[LIFF] LIFF initialized successfully");
          } catch (liffError) {
            console.warn("[LIFF] LIFF init failed, but continuing:", liffError);
            setIsLiffApp(true);
          }

          // ✅ Get the original URL from sessionStorage
          const storedOriginalUrl = sessionStorage.getItem("liff_original_url");

          // ✅ If on login page but have an original URL, redirect immediately
          if (currentPath === "/login" && storedOriginalUrl) {
            console.log(
              "[LIFF] Redirecting immediately to original URL:",
              storedOriginalUrl
            );
            router.replace(storedOriginalUrl);
            sessionStorage.removeItem("liff_original_url");
            return; // Exit early, don't set loading to false
          }

          // ✅ If not on login page, store current path as original URL
          if (currentPath !== "/login") {
            sessionStorage.setItem("liff_original_url", currentPath);
            console.log("[LIFF] Stored original URL:", currentPath);
          }
        } else {
          console.log("[LIFF] Not in LIFF environment");
          setIsLiffApp(false);
        }
      } catch (err) {
        console.error("[LIFF] Initialization error:", err);
        setError(err.message);
        setIsLiffApp(false);
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, [router]);

  return {
    isLiffApp,
    isLoading,
    error,
  };
}
