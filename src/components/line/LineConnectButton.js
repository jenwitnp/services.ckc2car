"use client";

import { useState } from "react";
import Button from "@/app/components/ui/Button";
import { Icons } from "@/app/components/ui/Icons";
import { toast } from "react-hot-toast"; // or your preferred toast library

export default function LineConnectButton({
  auth,
  onConnected,
  className = "",
  children,
  variant = "default",
  size = "default",
}) {
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [error, setError] = useState(null);

  console.log("LineConnectButton auth user:", auth?.user);

  const handleLineConnect = async () => {
    // ✅ Validate user authentication
    if (!auth?.user?.id) {
      toast.error("กรุณาเข้าสู่ระบบก่อนเชื่อมต่อ LINE");
      setError("กรุณาเข้าสู่ระบบก่อน");
      return;
    }

    console.log("🔗 Starting LINE connection for user:", auth.user.id);

    // ✅ Set loading state
    setStatus("loading");
    setError(null);

    // ✅ Show loading toast
    const loadingToast = toast.loading("กำลังเชื่อมต่อบัญชี LINE...");

    try {
      // ✅ Call API directly without popup
      const response = await fetch("/api/v1/users/line-connect/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId: auth.user.id,
          // If you have lineUserId from LIFF or other source, add it here
          // lineUserId: lineUserId,
        }),
      });

      const result = await response.json();
      console.log("🔗 LINE connect API response:", result);

      // ✅ Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.ok && (result.success || result.status === "ok")) {
        // ✅ Success state
        setStatus("success");

        // ✅ Show success toast
        toast.success("เชื่อมต่อบัญชี LINE สำเร็จ! 🎉");

        console.log("✅ Successfully connected LINE account");

        // ✅ Call success callback
        onConnected?.(result.lineUserId || auth.user.id);

        // ✅ Auto-reset status after 3 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } else {
        // ✅ Handle API errors
        const errorMessage =
          result.error || result.message || "ไม่สามารถเชื่อมต่อบัญชี LINE ได้";

        setStatus("error");
        setError(errorMessage);

        // ✅ Show error toast
        toast.error(`เกิดข้อผิดพลาด: ${errorMessage}`);

        console.error("❌ Failed to connect LINE account:", result);

        // ✅ Auto-reset status after 5 seconds
        setTimeout(() => {
          setStatus("idle");
          setError(null);
        }, 5000);
      }
    } catch (fetchError) {
      console.error("❌ LINE connect fetch error:", fetchError);

      // ✅ Dismiss loading toast
      toast.dismiss(loadingToast);

      setStatus("error");
      const errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง";
      setError(errorMessage);

      // ✅ Show error toast
      toast.error(errorMessage);

      // ✅ Auto-reset status after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setError(null);
      }, 5000);
    }
  };

  // ✅ Get button text and icon based on status
  const getButtonContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Icons.Spinner className="h-4 w-4 mr-2 animate-spin" />
            กำลังเชื่อมต่อ...
          </>
        );
      case "success":
        return (
          <>
            <Icons.Check className="h-4 w-4 mr-2 text-green-600" />
            เชื่อมต่อสำเร็จ!
          </>
        );
      case "error":
        return (
          <>
            <Icons.AlertCircle className="h-4 w-4 mr-2 text-red-600" />
            ลองใหม่อีกครั้ง
          </>
        );
      default:
        return (
          children || (
            <>
              <Icons.Line className="h-4 w-4 mr-2" />
              เชื่อมต่อบัญชี LINE
            </>
          )
        );
    }
  };

  // ✅ Get button variant based on status
  const getButtonVariant = () => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "destructive";
      default:
        return variant;
    }
  };

  return (
    <div className="line-connect-container">
      <Button
        onClick={handleLineConnect}
        disabled={status === "loading" || !auth?.user?.id}
        variant={getButtonVariant()}
        size={size}
        className={`transition-all duration-200 ${className}`}
      >
        {getButtonContent()}
      </Button>

      {/* ✅ Optional: Show error message below button */}
      {status === "error" && error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          <div className="flex items-center">
            <Icons.AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* ✅ Optional: Show success message below button */}
      {status === "success" && (
        <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
          <div className="flex items-center">
            <Icons.Check className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>เชื่อมต่อบัญชี LINE สำเร็จแล้ว</span>
          </div>
        </div>
      )}

      {/* ✅ Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-1 text-xs text-gray-500">
          Status: {status} | User ID: {auth?.user?.id || "None"}
        </div>
      )}
    </div>
  );
}
