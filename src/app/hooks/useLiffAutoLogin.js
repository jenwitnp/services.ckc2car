"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useLiffAutoLogin() {
  const [isLiffApp, setIsLiffApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestUser, setGuestUser] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null); // ✅ Track original URL
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const initLiff = async () => {
      try {
        // ✅ Capture the original URL before any redirects
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname + window.location.search;

        console.log("[LIFF] Current URL:", currentUrl);
        console.log("[LIFF] Current path:", currentPath);

        // Store original URL in sessionStorage for persistence
        if (
          !sessionStorage.getItem("liff_original_url") &&
          currentPath !== "/login"
        ) {
          sessionStorage.setItem("liff_original_url", currentPath);
          console.log("[LIFF] Stored original URL:", currentPath);
        }

        // Get stored original URL
        const storedOriginalUrl = sessionStorage.getItem("liff_original_url");
        setOriginalUrl(storedOriginalUrl);

        if (typeof window !== "undefined" && window.liff) {
          console.log("[LIFF] Initializing LIFF...");

          await window.liff.init({
            liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID,
          });

          setIsLiffApp(true);

          if (window.liff.isLoggedIn()) {
            console.log("[LIFF] User is logged in to LINE");

            const profile = await window.liff.getProfile();
            console.log("[LIFF] User profile:", profile);

            // ✅ Create enhanced guest user with original URL
            const enhancedGuestUser = {
              id: profile.userId,
              name: profile.displayName,
              pictureUrl: profile.pictureUrl,
              platform: "liff",
              originalUrl: storedOriginalUrl, // ✅ Include original URL
              loginTime: new Date().toISOString(),
            };

            setGuestUser(enhancedGuestUser);

            // ✅ Store guest data in sessionStorage with URL
            sessionStorage.setItem(
              "liff_guest_user",
              JSON.stringify(enhancedGuestUser)
            );

            console.log(
              "[LIFF] Guest user setup complete with original URL:",
              storedOriginalUrl
            );
          } else {
            console.log("[LIFF] User not logged in to LINE");
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
  }, []);

  // ✅ Function to navigate to original URL or fallback
  const navigateToOriginalUrl = (fallbackUrl = "/cars") => {
    const targetUrl = originalUrl || fallbackUrl;
    console.log("[LIFF] Navigating to:", targetUrl);

    // Clear the stored URL after use
    sessionStorage.removeItem("liff_original_url");

    router.push(targetUrl);
  };

  // ✅ Function to get original URL without consuming it
  const getOriginalUrl = () => {
    return originalUrl || sessionStorage.getItem("liff_original_url");
  };

  return {
    isLiffApp,
    isLoading,
    error,
    guestUser,
    originalUrl, // ✅ Expose original URL
    navigateToOriginalUrl, // ✅ Helper function
    getOriginalUrl, // ✅ Getter function
  };
}
