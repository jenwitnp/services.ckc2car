"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";

export default function LineConnectButton({
  onConnected,
  className = "",
  children,
}) {
  const { data: session, update } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const handleLineConnect = async () => {
    if (!session?.user?.id) {
      setError("Please login first");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log("[LineConnect] Starting LINE connection process");

      // Open LINE login in popup
      const popup = window.open(
        "/line-connect",
        "line-connect",
        "width=500,height=700,scrollbars=yes,resizable=yes"
      );

      // Listen for popup messages
      const handleMessage = async (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "LINE_CONNECT_SUCCESS") {
          const { lineUserId } = event.data;
          console.log("[LineConnect] Received LINE User ID:", lineUserId);

          try {
            // Link the accounts via API
            const response = await fetch("/api/v1/users/line-connect/link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: session.user.id,
                lineUserId: lineUserId,
              }),
            });

            const result = await response.json();

            if (result.success) {
              console.log("[LineConnect] Successfully linked accounts");

              // Update the session to reflect the change
              await update({
                linkedLineAccount: true,
                lineUserId: lineUserId,
              });

              onConnected?.(lineUserId);
              popup.close();
            } else {
              console.error(
                "[LineConnect] Failed to link accounts:",
                result.error
              );
              setError(result.error);
              popup.close();
            }
          } catch (linkError) {
            console.error("[LineConnect] Error linking accounts:", linkError);
            setError("Failed to link accounts");
            popup.close();
          }
        } else if (event.data.type === "LINE_CONNECT_ERROR") {
          console.error("[LineConnect] LINE connect error:", event.data.error);
          setError(event.data.error);
          popup.close();
        } else if (event.data.type === "LINE_CONNECT_CANCELLED") {
          console.log("[LineConnect] User cancelled LINE connection");
          popup.close();
        }
      };

      window.addEventListener("message", handleMessage);

      // Check if popup is closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("message", handleMessage);
          setIsConnecting(false);
        }
      }, 1000);
    } catch (error) {
      console.error("[LineConnect] Error opening popup:", error);
      setError("Failed to open LINE login");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="line-connect-container">
      <button
        onClick={handleLineConnect}
        disabled={isConnecting}
        className={`flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isConnecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            กำลังเชื่อมต่อ LINE...
          </>
        ) : (
          children || (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.28-.63.626-.63.352 0 .631.285.631.63v4.771z" />
              </svg>
              เชื่อมต่อบัญชี LINE
            </>
          )
        )}
      </button>

      {error && (
        <div className="mt-2 text-red-600 text-sm">เกิดข้อผิดพลาด: {error}</div>
      )}
    </div>
  );
}
