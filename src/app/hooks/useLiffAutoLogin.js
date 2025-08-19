"use client";
import { useEffect, useState } from "react";

export function useLiffAutoLogin() {
  const [isLiffApp, setIsLiffApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liffData, setLiffData] = useState(null);
  const [guestUser, setGuestUser] = useState(null); // ✅ Guest user for LIFF

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        // Load LINE LIFF SDK dynamically
        if (typeof window !== "undefined" && !window.liff) {
          const script = document.createElement("script");
          script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
          script.async = true;
          document.head.appendChild(script);

          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Initialize LIFF
        if (window.liff) {
          const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;

          if (!liffId) {
            console.warn("[LIFF] LIFF ID not configured");
            setIsLoading(false);
            return;
          }

          await window.liff.init({ liffId });

          if (window.liff.isInClient()) {
            setIsLiffApp(true);

            try {
              // ✅ Get LIFF profile for guest access (no authentication required)
              const profile = await window.liff.getProfile();
              const context = window.liff.getContext();

              setLiffData({ profile, context });

              // ✅ Create guest user from LIFF profile
              const guestUserData = {
                id: `liff_guest_${profile.userId}`,
                name: profile.displayName,
                image: profile.pictureUrl,
                userType: "liff_guest",
                lineUserId: profile.userId,
                isGuest: true,
              };

              setGuestUser(guestUserData);

              console.log("[LIFF] Guest user created:", guestUserData);
              console.log("[LIFF] LIFF context:", context);
            } catch (profileError) {
              console.warn(
                "[LIFF] Could not get profile, continuing as anonymous guest"
              );

              // ✅ Create anonymous guest if profile fails
              const anonymousGuest = {
                id: `liff_anonymous_${Date.now()}`,
                name: "ผู้เยียมชม LINE",
                image: null,
                userType: "liff_guest",
                lineUserId: null,
                isGuest: true,
                isAnonymous: true,
              };

              setGuestUser(anonymousGuest);
            }

            setIsLoading(false);
          } else {
            console.log("[LIFF] Not running in LINE client");
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("[LIFF] Initialization error:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeLiff();
  }, []);

  const sendMessage = async (message) => {
    if (window.liff && isLiffApp) {
      try {
        await window.liff.sendMessages([
          {
            type: "text",
            text: message,
          },
        ]);
        return true;
      } catch (err) {
        console.error("[LIFF] Send message error:", err);
        return false;
      }
    }
    return false;
  };

  const closeWindow = () => {
    if (window.liff && isLiffApp) {
      window.liff.closeWindow();
    }
  };

  // ✅ Function to login with the guest user (optional)
  const loginAsGuest = () => {
    if (guestUser) {
      // Store guest user in localStorage for persistence
      localStorage.setItem("liff_guest_user", JSON.stringify(guestUser));
      return guestUser;
    }
    return null;
  };

  return {
    isLiffApp,
    isLoading,
    error,
    liffData,
    guestUser, // ✅ Expose guest user
    sendMessage,
    closeWindow,
    loginAsGuest, // ✅ Optional login function
  };
}
