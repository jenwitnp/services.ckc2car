"use client";

import LineLoginBtn from "@/app/components/line/LineLoginBtn";
import LoginForm from "@/app/components/LoginForm";
import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiffGuest } from "@/app/contexts/LiffGuestProvider";

// ✅ LIFF Loading Component for Login Page
function LiffLoginLoading({ status, message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="text-center max-w-md mx-auto">
        {/* ✅ Dynamic loading animation based on status */}
        <div className="mb-8">
          {status === "authenticated" ? (
            <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <span className="text-white text-3xl">✓</span>
            </div>
          ) : status === "error" ? (
            <div className="w-20 h-20 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
              <span className="text-white text-2xl">⚠️</span>
            </div>
          ) : (
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">📱</span>
              </div>
              <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-transparent border-t-green-400 border-r-blue-400 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* ✅ Status message */}
        <h2 className="text-xl font-bold text-white mb-4">
          {status === "authenticated"
            ? "เข้าสู่ระบบสำเร็จ!"
            : "กำลังเข้าสู่ระบบ LINE"}
        </h2>

        <p
          className={`text-lg ${
            status === "authenticated"
              ? "text-green-300"
              : status === "error"
              ? "text-yellow-300"
              : "text-blue-300"
          } animate-pulse`}
        >
          {message}
        </p>

        {/* ✅ Progress indicator */}
        {status !== "authenticated" && status !== "error" && (
          <div className="mt-6">
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}

        {/* ✅ Additional info */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-green-200 text-sm">
            🔐 การเชื่อมต่อปลอดภัยผ่าน LINE LIFF
          </p>
          {status === "redirecting" && (
            <p className="text-blue-200 text-xs mt-1">
              กำลังนำทางไปยังหน้าที่คุณต้องการ...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Create a separate component for the search params logic
function LoginContent() {
  const [errorType, setErrorType] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);
  const { data: session, status } = useSession();
  const { isLiffApp, isLoading, loadingStatus, error, getLoadingMessage } =
    useLiffGuest();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Handle authenticated user redirects
  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      const userType = session.user.userType;
      const returnUrl = searchParams.get("returnUrl");

      if (userType === "internal") {
        console.log(
          "[Login] Internal user authenticated, redirecting to dashboard"
        );
        router.push("/dashboard");
      } else {
        const redirectUrl =
          returnUrl && returnUrl !== "/login" ? returnUrl : "/cars";
        console.log(
          "[Login] Customer authenticated, redirecting to:",
          redirectUrl
        );
        router.push(redirectUrl);
      }
    }
  }, [session, status, router, searchParams]);

  // ✅ For LIFF users that somehow reach this page without redirect, redirect them
  useEffect(() => {
    if (isLiffApp && !isLoading && !session && !error) {
      console.log("[Login] LIFF user on login page, redirecting to cars");
      router.replace("/cars");
    }
  }, [isLiffApp, isLoading, session, error, router]);

  // Check URL parameters for LINE account linking
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

  // ✅ Show LIFF loading with status for LIFF users
  if (isLiffApp && isLoading) {
    return (
      <LiffLoginLoading status={loadingStatus} message={getLoadingMessage()} />
    );
  }

  // ✅ Show regular loading for non-LIFF users
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">กำลังตรวจสอบสถานะ...</p>
        </div>
      </div>
    );
  }

  // ✅ For LIFF errors, show error and redirect
  if (isLiffApp && error) {
    setTimeout(() => {
      router.replace("/cars");
    }, 3000);

    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        <div className="text-center bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 m-4">
          <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <p className="text-yellow-300 text-lg mb-2">
            เกิดข้อผิดพลาดในการเชื่อมต่อ LINE
          </p>
          <p className="text-yellow-400 text-sm mb-4">
            กำลังนำคุณไปยังเว็บไซต์...
          </p>
          <button
            onClick={() => router.replace("/cars")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ดำเนินการต่อ
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

  // ✅ If LIFF user somehow reaches here, redirect immediately
  if (isLiffApp) {
    setTimeout(() => {
      router.replace("/cars");
    }, 500);

    return (
      <LiffLoginLoading
        status="redirecting"
        message="กำลังนำทางไปยังเว็บไซต์..."
      />
    );
  }

  // ✅ Regular Login Page for Non-LIFF Users Only
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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

        {/* Login Section */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ยินดีต้อนรับ
            </h2>
            <p className="text-gray-600">
              เข้าสู่ระบบเพื่อดูข้อมูลรถยนต์และติดต่อเจ้าหน้าที่
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

        {/* Footer */}
        <div className="text-center text-green-200 text-sm">
          <p>© {new Date().getFullYear()} บริษัท โชคคูณโชค จำกัด</p>
        </div>
      </div>
    </div>
  );
}

// ✅ Loading component for Suspense fallback
function LoginLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">กำลังโหลด...</p>
      </div>
    </div>
  );
}

// ✅ Main component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
