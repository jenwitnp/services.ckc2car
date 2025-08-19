"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const LiffGuestContext = createContext();

export function LiffGuestProvider({ children }) {
  const [isLiffApp, setIsLiffApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestUser, setGuestUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        const currentPath = window.location.pathname + window.location.search;
        console.log("[LIFF Guest] Current path:", currentPath);

        // ✅ Check if in LIFF environment
        if (typeof window !== "undefined" && window.liff) {
          console.log("[LIFF Guest] LIFF environment detected");
          setIsLiffApp(true);

          try {
            await window.liff.init({
              liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID,
            });
            console.log("[LIFF Guest] LIFF initialized successfully");

            // ✅ Create guest user automatically
            const guestUser = {
              id: `guest_${Date.now()}`,
              name: "ผู้เยี่ยมชม",
              type: "guest",
              platform: "liff",
              isAuthenticated: false,
              createdAt: new Date().toISOString(),
            };

            setGuestUser(guestUser);
            console.log("[LIFF Guest] Guest user created:", guestUser);

            // ✅ If on login page, get stored original URL and redirect immediately
            if (currentPath === "/login") {
              const storedUrl = sessionStorage.getItem("liff_original_url");
              if (storedUrl) {
                console.log(
                  "[LIFF Guest] Auto-redirecting to stored URL:",
                  storedUrl
                );
                sessionStorage.removeItem("liff_original_url");
                router.replace(storedUrl);
                return; // Exit early
              } else {
                // No stored URL, redirect to cars
                console.log("[LIFF Guest] No stored URL, redirecting to cars");
                router.replace("/cars");
                return; // Exit early
              }
            } else {
              // ✅ Not on login page, store current path as original URL for potential future use
              sessionStorage.setItem("liff_original_url", currentPath);
              console.log("[LIFF Guest] Stored current path:", currentPath);
            }
          } catch (liffError) {
            console.warn("[LIFF Guest] LIFF init failed:", liffError);

            // ✅ Even if LIFF fails, create guest user and redirect
            const guestUser = {
              id: `guest_${Date.now()}`,
              name: "ผู้เยี่ยมชม",
              type: "guest",
              platform: "liff-fallback",
              isAuthenticated: false,
              createdAt: new Date().toISOString(),
            };
            setGuestUser(guestUser);

            // ✅ If on login page, redirect immediately
            if (currentPath === "/login") {
              const storedUrl = sessionStorage.getItem("liff_original_url");
              router.replace(storedUrl || "/cars");
              return; // Exit early
            }
          }
        } else {
          console.log("[LIFF Guest] Not in LIFF environment");
          setIsLiffApp(false);
        }
      } catch (err) {
        console.error("[LIFF Guest] Initialization error:", err);
        setError(err.message);
        setIsLiffApp(false);
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, [router]);

  const value = {
    isLiffApp,
    isLoading,
    error,
    guestUser,
    isGuest: () => guestUser?.type === "guest",
  };

  return (
    <LiffGuestContext.Provider value={value}>
      {children}
    </LiffGuestContext.Provider>
  );
}

export const useLiffGuest = () => {
  const context = useContext(LiffGuestContext);
  if (!context) {
    throw new Error("useLiffGuest must be used within LiffGuestProvider");
  }
  return context;
};
