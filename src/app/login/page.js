"use client";

import LineLoginBtn from "@/app/components/line/LineLoginBtn";
import LoginForm from "@/app/components/LoginForm";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLiffAutoLogin } from "@/app/hooks/useLiffAutoLogin";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [errorType, setErrorType] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);
  const [countdown, setCountdown] = useState(2); // ✅ Add countdown state
  const {
    isLiffApp,
    isLoading,
    error,
    guestUser,
    originalUrl,
    shouldAutoRedirect, // ✅ Get auto-redirect state
    navigateToOriginalUrl,
    getOriginalUrl,
    cancelAutoRedirect, // ✅ Get cancel function
  } = useLiffAutoLogin();
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Countdown timer for auto-redirect
  useEffect(() => {
    if (shouldAutoRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldAutoRedirect, countdown]);

  // ✅ Handle session-based redirects with URL preservation
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const userType = session.user.userType;

      // ✅ For authenticated users, check if they have an original URL to return to
      const targetUrl = getOriginalUrl();

      if (userType === "internal") {
        console.log(
          "[Login] Internal user authenticated, redirecting to dashboard"
        );
        router.push("/dashboard");
      } else {
        if (targetUrl && targetUrl !== "/login") {
          console.log(
            "[Login] Customer authenticated, redirecting to original URL:",
            targetUrl
          );
          router.push(targetUrl);
          // Clear the stored URL
          sessionStorage.removeItem("liff_original_url");
        } else {
          console.log("[Login] Customer authenticated, redirecting to cars");
          router.push("/cars");
        }
      }
    }
  }, [session, status, router, getOriginalUrl]);

  // Check URL parameters for old architecture
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      const lineId = params.get("lineUserId");

      setErrorType(error);
      setLineUserId(lineId);
    }
  }, []);

  const showCredentialsForm =
    errorType === "LineAccountNotLinked" && lineUserId;

  // ✅ Handle guest access to original URL
  const handleGuestAccess = () => {
    if (originalUrl && originalUrl !== "/login") {
      console.log("[Login] Guest accessing original URL:", originalUrl);
      navigateToOriginalUrl();
    } else {
      console.log("[Login] Guest accessing default cars page");
      router.push("/cars");
    }
  };

  // Show loading while LIFF is initializing or session is loading
  if (isLoading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {isLiffApp ? "กำลังเตรียม LIFF..." : "กำลังตรวจสอบสถานะ..."}
          </p>
          <p className="text-green-300 text-sm mt-2">โปรดรอสักครู่</p>
        </div>
      </div>
    );
  }

  // Show error if LIFF initialization failed
  if (isLiffApp && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <div className="text-center bg-red-500/20 border border-red-500/30 rounded-lg p-6 m-4">
          <p className="text-red-300 text-lg mb-2">
            เกิดข้อผิดพลาดในการเตรียม LIFF
          </p>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            โหลดใหม่
          </button>
        </div>
      </div>
    );
  }

  // Don't show login form if user is already authenticated
  if (session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <p className="text-white text-lg">กำลังเปลี่ยนหน้า...</p>
        </div>
      </div>
    );
  }

  // ✅ Determine the destination for guest access
  const getGuestDestination = () => {
    if (originalUrl && originalUrl !== "/login") {
      // Parse the original URL to show a friendly name
      if (originalUrl.includes("/cars/")) {
        const carId = originalUrl.split("/cars/")[1];
        return `รถยนต์ที่คุณสนใจ (ID: ${carId})`;
      } else if (originalUrl.includes("/cars")) {
        return "หน้ารายการรถยนต์";
      } else if (originalUrl.includes("/ai-chat")) {
        return "แชทบอท AI";
      }
      return "หน้าที่คุณเข้าชมก่อนหน้า";
    }
    return "หน้ารายการรถยนต์";
  };

  // ✅ Show auto-redirect screen for LIFF guests
  if (shouldAutoRedirect && guestUser && originalUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-green-300 mb-2">
                ยินดีต้อนรับ {guestUser.name}!
              </h2>
              <p className="text-green-400">LIFF ยืนยันตัวตนเรียบร้อยแล้ว</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-white mb-2">กำลังนำคุณไปยัง:</p>
              <p className="text-green-300 font-medium">
                {getGuestDestination()}
              </p>

              {/* ✅ Countdown display */}
              <div className="mt-4">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {countdown}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((2 - countdown) / 2) * 100}%` }}
                  ></div>
                </div>
                <p className="text-green-400 text-sm mt-2">
                  วินาทีเพื่อเปลี่ยนหน้าอัตโนมัติ
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* ✅ Go now button */}
              <button
                onClick={handleGuestAccess}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ไปเลยตอนนี้ →
              </button>

              {/* ✅ Cancel auto-redirect button */}
              <button
                onClick={cancelAutoRedirect}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                ยกเลิกการเปลี่ยนหน้าอัตโนมัติ
              </button>

              {/* ✅ Alternative option */}
              <button
                onClick={() => {
                  cancelAutoRedirect();
                  router.push("/cars");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                ดูรถยนต์ทั้งหมดแทน
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* ✅ Enhanced LIFF guest options (shown only if not auto-redirecting) */}
        {isLiffApp && guestUser && !shouldAutoRedirect && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded">
            <div className="text-center text-green-300">
              <p className="text-lg mb-2">🎉 ยินดีต้อนรับ {guestUser.name}!</p>

              {/* ✅ Show original destination */}
              <p className="text-sm mb-3">
                {originalUrl && originalUrl !== "/login"
                  ? `กลับไปยัง: ${getGuestDestination()}`
                  : "คุณสามารถเข้าชมข้อมูลรถยนต์ได้เลย"}
              </p>

              {/* ✅ Smart button text based on destination */}
              <button
                onClick={handleGuestAccess}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors mb-2"
              >
                {originalUrl && originalUrl !== "/login"
                  ? "กลับไปหน้าเดิม"
                  : "เข้าชมรถยนต์ทันที"}
              </button>

              {/* ✅ Show alternative option if they had an original URL */}
              {originalUrl && originalUrl !== "/login" && (
                <button
                  onClick={() => router.push("/cars")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-4 rounded transition-colors text-sm"
                >
                  หรือดูรถยนต์ทั้งหมด
                </button>
              )}
            </div>
          </div>
        )}

        {/* Login Section - Only show if not auto-redirecting */}
        {!shouldAutoRedirect && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isLiffApp ? "หรือเข้าสู่ระบบ" : "ยินดีต้อนรับ"}
              </h2>
              <p className="text-gray-600">
                {isLiffApp
                  ? "เพื่อใช้ฟีเจอร์พิเศษและบันทึกข้อมูล"
                  : "เข้าสู่ระบบเพื่อดูข้อมูลรถยนต์และติดต่อเจ้าหน้าที่"}
              </p>
            </div>

            {/* Conditional Login Form */}
            {showCredentialsForm ? (
              <>
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded text-blue-700 text-sm">
                  เพื่อเชื่อมต่อบัญชี LINE ของคุณ
                  กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้และรหัสผ่านของคุณก่อน
                </div>
                <LoginForm lineUserIdToLink={lineUserId} />
              </>
            ) : (
              /* Show normal login options */
              <div className="space-y-4">
                {!isLiffApp && <LineLoginBtn />}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      {isLiffApp ? "สำหรับพนักงาน" : "หรือ"}
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <a
                    href="/login/internal"
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                  >
                    เข้าสู่ระบบสำหรับพนักงาน
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-green-200 text-sm">
          <p>© {new Date().getFullYear()} บริษัท โชคคูณโชค จำกัด</p>
        </div>
      </div>
    </div>
  );
}
