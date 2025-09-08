"use client";

import { Suspense } from "react";
import { LoginPageContent, LoadingScreen } from "./components";

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense
      fallback={<LoadingScreen message="กำลังโหลดหน้าเข้าสู่ระบบ..." />}
    >
      <LoginPageContent />
    </Suspense>
  );
}
