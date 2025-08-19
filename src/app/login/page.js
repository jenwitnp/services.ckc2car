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
  const { isLiffApp, isLoading, error, guestUser } = useLiffAutoLogin();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Handle session-based redirects
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const userType = session.user.userType;

      if (userType === "internal") {
        console.log(
          "[Login] Internal user authenticated, redirecting to dashboard"
        );
        router.push("/dashboard");
      } else {
        console.log("[Login] Customer authenticated, redirecting to cars");
        router.push("/cars");
      }
    }
  }, [session, status, router]);

  // ✅ Handle LIFF guest access
  useEffect(() => {
    if (isLiffApp && guestUser && !session) {
      console.log("[Login] LIFF guest detected, allowing access to cars");
      // Don't auto-redirect, let them choose
    }
  }, [isLiffApp, guestUser, session]);

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

  // Show loading while LIFF is initializing or session is loading
  if (isLoading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-green-600 to-green-900">
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
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-green-600 to-green-900">
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
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-green-600 to-green-900">
        <div className="text-center">
          <p className="text-white text-lg">กำลังเปลี่ยนหน้า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Company Name */}
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-white rounded-full flex items-center justify-center mb-4">
            <Image
              src="/logo-ckc.png"
              alt="CKC Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CKC SERVICES</h1>
          <p className="text-green-300">ศูนย์บริการข้อมูลรถยนต์</p>
        </div>

        {/* ✅ Show LIFF guest options */}
        {isLiffApp && guestUser && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded">
            <div className="text-center text-green-300">
              <p className="text-lg mb-2">🎉 ยินดีต้อนรับ {guestUser.name}!</p>
              <p className="text-sm mb-3">คุณสามารถเข้าชมข้อมูลรถยนต์ได้เลย</p>
              <button
                onClick={() => router.push("/cars")}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                เข้าชมรถยนต์ทันที
              </button>
            </div>
          </div>
        )}

        {/* Login Section */}
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

        {/* Footer */}
        <div className="text-center text-green-200 text-sm">
          <p>© {new Date().getFullYear()} บริษัท โชคคูณโชค จำกัด</p>
        </div>
      </div>
    </div>
  );
}
