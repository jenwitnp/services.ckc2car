"use client";
import { useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";

export function useLiffAutoLogin() {
  const [isLiffApp, setIsLiffApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liffData, setLiffData] = useState(null);

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

            // Get LIFF profile and context
            const profile = await window.liff.getProfile();
            const context = window.liff.getContext();

            setLiffData({ profile, context });

            console.log("[LIFF] User profile:", profile);
            console.log("[LIFF] LIFF context:", context);

            // Check if user is already authenticated with NextAuth
            const session = await getSession();

            if (!session) {
              console.log("[LIFF] No session, starting auto-login...");

              // Auto-login with LINE
              await signIn("line", {
                callbackUrl: window.location.href,
                redirect: false,
              });

              // Refresh session after login
              setTimeout(async () => {
                const newSession = await getSession();
                if (newSession) {
                  console.log("[LIFF] Auto-login successful:", newSession.user);
                  window.location.reload();
                }
              }, 2000);
            } else {
              console.log("[LIFF] User already authenticated:", session.user);
            }
          } else {
            console.log("[LIFF] Not running in LINE client");
          }
        }
      } catch (err) {
        console.error("[LIFF] Initialization error:", err);
        setError(err.message);
      } finally {
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

  return {
    isLiffApp,
    isLoading,
    error,
    liffData,
    sendMessage,
    closeWindow,
  };
}
