"use client"; // Add this to make it a client component

import LineLoginBtn from "@/app/components/line/LineLoginBtn";
import LoginForm from "@/app/components/LoginForm";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [errorType, setErrorType] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);

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

  return (
    <div className="flex flex-col items-center w-full">
      {/* Logo and Company Name */}
      <div className="mb-6 md:mb-8 text-center w-full">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">
          CKC CRM
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          ระบบจัดการลูกค้าออนไลน์บริษัทโชคคูณโชค
        </p>
      </div>

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
          /* Show normal LINE login button */
          <LineLoginBtn />
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
