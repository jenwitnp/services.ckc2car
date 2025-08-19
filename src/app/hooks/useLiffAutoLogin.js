"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useLiffAutoLogin() {
  const [isLiffApp, setIsLiffApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestUser, setGuestUser] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [shouldAutoRedirect, setShouldAutoRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        const currentUrl = window.location.href;
        const currentPath = window.location.pathname + window.location.search;

        console.log("[LIFF] Current URL:", currentUrl);
        console.log("[LIFF] Current path:", currentPath);

        if (
          !sessionStorage.getItem("liff_original_url") &&
          currentPath !== "/login"
        ) {
          sessionStorage.setItem("liff_original_url", currentPath);
          console.log("[LIFF] Stored original URL:", currentPath);
        }

        const storedOriginalUrl = sessionStorage.getItem("liff_original_url");
        setOriginalUrl(storedOriginalUrl);

        if (typeof window !== "undefined" && window.liff) {
          console.log("[LIFF] Initializing LIFF...");

          await window.liff.init({
            liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID,
          });

          setIsLiffApp(true);

          // ✅ Create anonymous guest user without requiring LINE login
          console.log(
            "[LIFF] Creating anonymous guest user for immediate access"
          );

          const anonymousGuestUser = {
            id: `liff_guest_${Date.now()}`,
            name: "ผู้เยี่ยมชม LIFF",
            pictureUrl: null,
            platform: "liff",
            isAnonymous: true,
            originalUrl: storedOriginalUrl,
            loginTime: new Date().toISOString(),
          };

          setGuestUser(anonymousGuestUser);

          sessionStorage.setItem(
            "liff_guest_user",
            JSON.stringify(anonymousGuestUser)
          );

          console.log(
            "[LIFF] Anonymous guest user setup complete with original URL:",
            storedOriginalUrl
          );

          // ✅ Enable immediate redirect if we have an original URL
          if (storedOriginalUrl && window.location.pathname === "/login") {
            console.log("[LIFF] Auto-redirect enabled for anonymous guest");
            setShouldAutoRedirect(true);
          } else if (
            storedOriginalUrl &&
            window.location.pathname !== storedOriginalUrl
          ) {
            // ✅ If we're not on the login page and have an original URL, redirect immediately
            console.log("[LIFF] Redirecting immediately to original URL");
            setTimeout(() => {
              navigateToOriginalUrl();
            }, 100);
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

  // ✅ Immediate auto-redirect effect (no countdown)
  useEffect(() => {
    if (shouldAutoRedirect && guestUser && originalUrl && !error) {
      console.log(
        "[LIFF] Auto-redirecting guest to original URL immediately:",
        originalUrl
      );

      // ✅ Very short delay just to ensure UI state is set
      const timer = setTimeout(() => {
        navigateToOriginalUrl();
      }, 100); // 0.1 seconds

      return () => clearTimeout(timer);
    }
  }, [shouldAutoRedirect, guestUser, originalUrl, error]);

  const navigateToOriginalUrl = (fallbackUrl = "/cars") => {
    const targetUrl = originalUrl || fallbackUrl;
    console.log("[LIFF] Navigating to:", targetUrl);
    router.push(targetUrl);
  };

  const getOriginalUrl = () => {
    return originalUrl || sessionStorage.getItem("liff_original_url");
  };

  const cancelAutoRedirect = () => {
    setShouldAutoRedirect(false);
    console.log("[LIFF] Auto-redirect cancelled by user");
  };

  const checkLineLogin = async () => {
    if (isLiffApp && window.liff && window.liff.isLoggedIn()) {
      try {
        const profile = await window.liff.getProfile();
        return {
          isLoggedIn: true,
          profile: {
            id: profile.userId,
            name: profile.displayName,
            pictureUrl: profile.pictureUrl,
          },
        };
      } catch (error) {
        console.error("Error getting LINE profile:", error);
        return { isLoggedIn: false, profile: null };
      }
    }
    return { isLoggedIn: false, profile: null };
  };

  return {
    isLiffApp,
    isLoading,
    error,
    guestUser,
    originalUrl,
    shouldAutoRedirect,
    navigateToOriginalUrl,
    getOriginalUrl,
    cancelAutoRedirect,
    checkLineLogin,
  };
}
