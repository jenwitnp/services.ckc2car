"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// ✅ Import LIFF SDK from npm
import liff from "@line/liff";

const LiffGuestContext = createContext();

export function LiffGuestProvider({ children }) {
  const [isLiffApp, setIsLiffApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState("initializing");
  const [error, setError] = useState(null);
  const [guestUser, setGuestUser] = useState(null);
  const [lineUser, setLineUser] = useState(null); // ✅ New LINE user state
  const router = useRouter();

  useEffect(() => {
    const initLiff = async () => {
      try {
        setLoadingStatus("detecting");
        const currentPath = window.location.pathname + window.location.search;
        console.log("[LIFF Guest] Current path:", currentPath);

        // ✅ Check if we're in a browser environment
        if (typeof window !== "undefined") {
          console.log("[LIFF Guest] Browser environment detected");
          setLoadingStatus("connecting");

          try {
            // ✅ Initialize LIFF using the npm package
            await liff.init({
              liffId: process.env.NEXT_PUBLIC_LINE_LIFF_ID,
            });

            console.log("[LIFF Guest] LIFF initialized successfully");

            // ✅ Check if we're actually in a LIFF environment
            if (liff.isInClient()) {
              console.log("[LIFF Guest] Running inside LINE app");
              setIsLiffApp(true);
              setLoadingStatus("checking_login");

              // ✅ Check if user is logged in to LINE
              if (liff.isLoggedIn()) {
                console.log("[LIFF Guest] User is logged in to LINE");
                setLoadingStatus("getting_profile");

                try {
                  // ✅ Get LINE user profile
                  const profile = await liff.getProfile();
                  console.log("[LIFF Guest] LINE profile obtained:", profile);

                  // ✅ Get access token for API calls
                  const accessToken = liff.getAccessToken();

                  // ✅ Create LINE user object
                  const lineUserData = {
                    userId: profile.userId, // ✅ This is the LINE User ID you need!
                    displayName: profile.displayName,
                    pictureUrl: profile.pictureUrl,
                    statusMessage: profile.statusMessage,
                    accessToken: accessToken,
                    isLoggedIn: true,
                    loginMethod: "liff_auto",
                    obtainedAt: new Date().toISOString(),
                  };

                  setLineUser(lineUserData);

                  // ✅ Create authenticated user
                  const authenticatedUser = {
                    id: profile.userId, // ✅ Use LINE User ID as primary ID
                    lineUserId: profile.userId, // ✅ Explicit LINE User ID field
                    name: profile.displayName,
                    displayName: profile.displayName,
                    pictureUrl: profile.pictureUrl,
                    type: "line_user",
                    platform: "liff",
                    isAuthenticated: true,
                    isInLineApp: true,
                    createdAt: new Date().toISOString(),
                    accessToken: accessToken,
                    liffInfo: {
                      isInClient: liff.isInClient(),
                      isLoggedIn: liff.isLoggedIn(),
                      os: liff.getOS(),
                      language: liff.getLanguage(),
                      version: liff.getVersion(),
                      lineVersion: liff.getLineVersion(),
                      isApiAvailable: liff.isApiAvailable("shareTargetPicker"),
                    },
                  };

                  setGuestUser(authenticatedUser);
                  setLoadingStatus("authenticated");
                  console.log(
                    "[LIFF Guest] Authenticated user created:",
                    authenticatedUser
                  );
                } catch (profileError) {
                  console.error(
                    "[LIFF Guest] Failed to get profile:",
                    profileError
                  );
                  setError("Failed to get LINE profile");
                  setLoadingStatus("profile_error");

                  // ✅ Fall back to anonymous user in LINE app
                  const anonymousUser = {
                    id: `line_anonymous_${Date.now()}`,
                    name: "LINE User (Anonymous)",
                    type: "line_anonymous",
                    platform: "liff",
                    isAuthenticated: false,
                    isInLineApp: true,
                    createdAt: new Date().toISOString(),
                    error: profileError.message,
                  };
                  setGuestUser(anonymousUser);
                }
              } else {
                console.log("[LIFF Guest] User not logged in to LINE");
                setLoadingStatus("not_logged_in");

                // ✅ Create non-authenticated LINE app user
                const lineAppUser = {
                  id: `line_guest_${Date.now()}`,
                  name: "LINE User (Not Logged In)",
                  type: "line_guest",
                  platform: "liff",
                  isAuthenticated: false,
                  isInLineApp: true,
                  createdAt: new Date().toISOString(),
                  canLogin: true, // ✅ Can trigger login
                  liffInfo: {
                    isInClient: liff.isInClient(),
                    isLoggedIn: liff.isLoggedIn(),
                    os: liff.getOS(),
                    language: liff.getLanguage(),
                    version: liff.getVersion(),
                    lineVersion: liff.getLineVersion(),
                  },
                };
                setGuestUser(lineAppUser);
              }
            } else {
              console.log("[LIFF Guest] Running in external browser");
              setIsLiffApp(false);
              setLoadingStatus("external_browser");

              // ✅ Create browser guest user
              const browserUser = {
                id: `browser_guest_${Date.now()}`,
                name: "ผู้เยี่ยมชม",
                type: "guest",
                platform: "external",
                isAuthenticated: false,
                isInLineApp: false,
                createdAt: new Date().toISOString(),
              };
              setGuestUser(browserUser);
            }

            // ✅ Small delay to show success state
            await new Promise((resolve) => setTimeout(resolve, 500));

            // ✅ Just log the path handling without redirects
            if (currentPath === "/login") {
              setLoadingStatus("login_page_detected");
              const storedUrl = sessionStorage.getItem("liff_original_url");
              if (storedUrl) {
                console.log("[LIFF Guest] Stored URL found:", storedUrl);
                sessionStorage.removeItem("liff_original_url");
              } else {
                console.log("[LIFF Guest] No stored URL found");
              }
            } else {
              sessionStorage.setItem("liff_original_url", currentPath);
              console.log("[LIFF Guest] Stored current path:", currentPath);
            }
          } catch (liffError) {
            console.warn("[LIFF Guest] LIFF init failed:", liffError);
            setLoadingStatus("fallback");
            setError(liffError.message);

            // ✅ Create fallback guest user
            const fallbackUser = {
              id: `fallback_${Date.now()}`,
              name: "ผู้เยี่ยมชม",
              type: "guest",
              platform: "liff-fallback",
              isAuthenticated: false,
              isInLineApp: false,
              createdAt: new Date().toISOString(),
              error: liffError.message,
            };
            setGuestUser(fallbackUser);

            // ✅ Just log fallback handling
            if (currentPath === "/login") {
              const storedUrl = sessionStorage.getItem("liff_original_url");
              console.log(
                "[LIFF Guest] Fallback mode - stored URL:",
                storedUrl || "none"
              );
            }
          }
        } else {
          console.log("[LIFF Guest] Server-side rendering detected");
          setIsLiffApp(false);
          setLoadingStatus("ssr");
        }
      } catch (err) {
        console.error("[LIFF Guest] Initialization error:", err);
        setError(err.message);
        setIsLiffApp(false);
        setLoadingStatus("error");
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ Only run on client side
    if (typeof window !== "undefined") {
      initLiff();
    } else {
      setIsLoading(false);
      setLoadingStatus("ssr");
    }
  }, [router]);

  // ✅ Function to trigger LINE login
  const loginWithLine = () => {
    if (isLiffApp && !liff.isLoggedIn()) {
      console.log("[LIFF Guest] Triggering LINE login");
      liff.login({
        redirectUri: window.location.href,
      });
    }
  };

  // ✅ Function to logout from LINE
  const logoutFromLine = () => {
    if (isLiffApp && liff.isLoggedIn()) {
      console.log("[LIFF Guest] Logging out from LINE");
      liff.logout();
      // Reset user states
      setLineUser(null);
      setGuestUser(null);
      // Reinitialize
      window.location.reload();
    }
  };

  // ✅ Enhanced helper functions
  const value = {
    isLiffApp,
    isLoading,
    loadingStatus,
    error,
    guestUser,
    lineUser, // ✅ Expose LINE user data
    liff, // ✅ Expose LIFF instance for advanced usage

    // ✅ Authentication functions
    loginWithLine,
    logoutFromLine,

    // ✅ Helper functions
    isGuest: () => guestUser?.type === "guest",
    isLineUser: () => guestUser?.type === "line_user",
    isAuthenticated: () => guestUser?.isAuthenticated || false,
    isInLineApp: () => guestUser?.isInLineApp || false,

    // ✅ Get LINE User ID easily
    getLineUserId: () => lineUser?.userId || guestUser?.lineUserId || null,
    getDisplayName: () =>
      lineUser?.displayName ||
      guestUser?.displayName ||
      guestUser?.name ||
      "ผู้เยี่ยมชม",
    getAccessToken: () => lineUser?.accessToken || null,

    // ✅ LIFF-specific helpers
    canUseLineFeatures: () => {
      return isLiffApp && typeof liff !== "undefined" && liff.isInClient();
    },

    sharePage: async (url, text) => {
      if (
        value.canUseLineFeatures() &&
        liff.isApiAvailable("shareTargetPicker")
      ) {
        try {
          await liff.shareTargetPicker([
            {
              type: "text",
              text: `${text}\n${url}`,
            },
          ]);
          return true;
        } catch (error) {
          console.error("Share failed:", error);
          return false;
        }
      }
      return false;
    },

    openWindow: (url, external = false) => {
      if (value.canUseLineFeatures()) {
        liff.openWindow({
          url: url,
          external: external,
        });
      } else {
        window.open(url, external ? "_blank" : "_self");
      }
    },

    getLoadingMessage: () => {
      switch (loadingStatus) {
        case "detecting":
          return "กำลังตรวจสอบสภาพแวดล้อม LINE...";
        case "connecting":
          return "กำลังเชื่อมต่อกับ LINE LIFF...";
        case "checking_login":
          return "กำลังตรวจสอบสถานะการเข้าสู่ระบบ...";
        case "getting_profile":
          return "กำลังดึงข้อมูลผู้ใช้ LINE...";
        case "authenticated":
          return "เข้าสู่ระบบสำเร็จ!";
        case "not_logged_in":
          return "ยังไม่ได้เข้าสู่ระบบ LINE";
        case "profile_error":
          return "ไม่สามารถดึงข้อมูลผู้ใช้ได้";
        case "external_browser":
          return "กำลังเตรียมโหมดเบราว์เซอร์...";
        case "login_page_detected":
          return "ตรวจพบหน้าล็อกอิน...";
        case "fallback":
          return "กำลังใช้โหมดสำรอง...";
        case "error":
          return "เกิดข้อผิดพลาด กำลังลองใหม่...";
        case "ssr":
          return "กำลังโหลดเซิร์ฟเวอร์...";
        default:
          return "กำลังเตรียมความพร้อม...";
      }
    },
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
