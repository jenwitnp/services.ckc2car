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
  const {
    isLiffApp,
    isLoading,
    error,
    guestUser,
    originalUrl,
    shouldAutoRedirect,
    navigateToOriginalUrl,
    getOriginalUrl,
    cancelAutoRedirect,
  } = useLiffAutoLogin();
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ Handle session-based redirects with URL preservation
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const userType = session.user.userType;
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
            {isLiffApp ? "กำลังเข้าถึง LIFF..." : "กำลังตรวจสอบสถานะ..."}
          </p>
          <p className="text-green-300 text-sm mt-2">
            {isLiffApp ? "เตรียมพาคุณไปยังหน้าที่ต้องการ..." : "โปรดรอสักครู่"}
          </p>
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
            เกิดข้อผิดพลาดในการเข้าถึง LIFF
          </p>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              โหลดใหม่
            </button>
            <button
              onClick={() => router.push("/cars")}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ไปหน้ารถยนต์
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Don't show login form if user is already authenticated
  if (session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">✓</span>
            </div>
          </div>
          <p className="text-white text-lg">กำลังเปลี่ยนหน้า...</p>
        </div>
      </div>
    );
  }

  // ✅ Determine the destination for guest access
  const getGuestDestination = () => {
    if (originalUrl && originalUrl !== "/login") {
      if (originalUrl.includes("/cars/")) {
        const carId = originalUrl.split("/cars/")[1];
        return `รถยนต์ที่คุณสนใจ`;
      } else if (originalUrl.includes("/cars")) {
        return "หน้ารายการรถยนต์";
      } else if (originalUrl.includes("/ai-chat")) {
        return "แชทบอท AI";
      }
      return "หน้าที่คุณเข้าชมก่อนหน้า";
    }
    return "หน้ารายการรถยนต์";
  };

  // ✅ Show immediate redirect screen for LIFF guests (no countdown)
  if (shouldAutoRedirect && guestUser && originalUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-white text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-green-300 mb-2">
                ยินดีต้อนรับสู่ CKC2Car!
              </h2>
              <p className="text-green-400">พร้อมพาคุณไปยังหน้าที่ต้องการ</p>
            </div>

            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-white mb-2">ปลายทาง:</p>
              <p className="text-green-300 font-medium text-lg">
                {getGuestDestination()}
              </p>

              {/* ✅ Simple progress indicator without countdown */}
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-green-500 h-2 rounded-full animate-pulse w-full"></div>
                </div>
                <p className="text-green-400 text-sm mt-2">
                  กำลังเตรียมความพร้อม...
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* ✅ Prominent go now button */}
              <button
                onClick={handleGuestAccess}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center">
                  เข้าสู่เว็บไซต์ →
                </span>
              </button>

              {/* ✅ Secondary options */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    cancelAutoRedirect();
                    router.push("/cars");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  ดูรถทั้งหมด
                </button>

                <button
                  onClick={cancelAutoRedirect}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  หยุดชั่วคราว
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ For LIFF users who aren't auto-redirecting, show clean interface
  if (isLiffApp && guestUser && !shouldAutoRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚗</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                ยินดีต้อนรับสู่ CKC2Car
              </h2>
              <p className="text-green-300">ค้นหารถยนต์ในฝันของคุณ</p>
            </div>

            {originalUrl && originalUrl !== "/login" && (
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-white text-sm mb-2">กลับไปยัง:</p>
                <p className="text-green-300 font-medium">
                  {getGuestDestination()}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* ✅ Primary action button */}
              <button
                onClick={handleGuestAccess}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center justify-center">
                  {originalUrl && originalUrl !== "/login"
                    ? "กลับไปหน้าเดิม"
                    : "เริ่มดูรถยนต์"}{" "}
                  →
                </span>
              </button>

              {/* ✅ Alternative option */}
              {originalUrl && originalUrl !== "/login" && (
                <button
                  onClick={() => router.push("/cars")}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-white/20"
                >
                  หรือดูรถยนต์ทั้งหมด
                </button>
              )}
            </div>

            {/* ✅ Future login option */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-green-300 text-sm mb-3">
                ต้องการฟีเจอร์เพิ่มเติม?
              </p>
              <button
                onClick={() => {
                  alert("ฟีเจอร์เข้าสู่ระบบ LINE จะมาเร็วๆ นี้!");
                }}
                className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm border border-gray-600/30"
              >
                เข้าสู่ระบบ LINE (เร็วๆ นี้)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Regular login page for non-LIFF users
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ยินดีต้อนรับ
            </h2>
            <p className="text-gray-600">
              เข้าสู่ระบบเพื่อดูข้อมูลรถยนต์และติดต่อเจ้าหน้าที่
            </p>
          </div>

          {showCredentialsForm ? (
            <>
              <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded text-blue-700 text-sm">
                เพื่อเชื่อมต่อบัญชี LINE ของคุณ
                กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้และรหัสผ่านของคุณก่อน
              </div>
              <LoginForm lineUserIdToLink={lineUserId} />
            </>
          ) : (
            <div className="space-y-4">
              <LineLoginBtn />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">หรือ</span>
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

        <div className="text-center text-green-200 text-sm">
          <p>© {new Date().getFullYear()} บริษัท โชคคูณโชค จำกัด</p>
        </div>
      </div>
    </div>
  );
}
