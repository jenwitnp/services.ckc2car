"use client";

import LineLoginBtn from "@/app/components/line/LineLoginBtn";
import LoginForm from "@/app/components/LoginForm";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useLiffAutoLogin } from "@/app/hooks/useLiffAutoLogin";

export default function LoginPage() {
  const [errorType, setErrorType] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);
  const { isLiffApp, isLoading, error } = useLiffAutoLogin();

  // Check URL parameters on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const lineId = params.get("lineUserId");

    setErrorType(error);
    setLineUserId(lineId);
  }, []);

  // Determine which login form to show
  const showCredentialsForm =
    errorType === "LineAccountNotLinked" && lineUserId;

  // Show loading while LIFF is initializing
  if (isLiffApp && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-main-600 to-main-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">กำลังเข้าสู่ระบบผ่าน LINE...</p>
          <p className="text-main-300 text-sm mt-2">โปรดรอสักครู่</p>
        </div>
      </div>
    );
  }

  // Show error if LIFF initialization failed
  if (isLiffApp && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-main-600 to-main-900">
        <div className="text-center bg-red-500/20 border border-red-500/30 rounded-lg p-6 m-4">
          <p className="text-red-300 text-lg mb-2">
            เกิดข้อผิดพลาดในการเข้าสู่ระบบ
          </p>
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Logo and Company Name */}
      <div className="mb-6 md:mb-8 text-center w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
          CKC SERVICES
        </h1>
        <p className="text-main-400 text-sm md:text-base">
          ckc2car data services | ศูนย์บริการข้อมูลบริษัทโชคคูณโชค
        </p>
      </div>

      {/* Show LIFF info if detected */}
      {isLiffApp && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded text-green-300 text-sm w-full text-center">
          🎉 เข้าถึงผ่าน LINE แอป - กำลังเข้าสู่ระบบอัตโนมัติ
        </div>
      )}

      {/* Conditional Login Form */}
      <div className="w-full">
        {showCredentialsForm ? (
          <>
            {/* Show instructions for linking */}
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300 text-sm">
              เพื่อเชื่อมต่อบัญชี LINE ของคุณ
              กรุณาเข้าสู่ระบบด้วยบัญชีผู้ใช้และรหัสผ่านของคุณก่อน
            </div>

            {/* Show credentials form with LINE ID to link */}
            <LoginForm lineUserIdToLink={lineUserId} />
          </>
        ) : (
          /* Show normal LINE login button (hidden in LIFF) */
          !isLiffApp && <LineLoginBtn />
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center text-xs text-gray-500 w-full">
        <p>
          © {new Date().getFullYear()} บริษัท โชคคูณโชค จำกัด. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
