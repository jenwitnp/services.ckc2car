"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import { useLiffGuest } from "../contexts/LiffGuestProvider";

// ✅ LIFF Loading Component
function LiffLoadingScreen() {
  return (
    <div className="fixed inset-0  flex items-center justify-center z-50">
      <div className="text-center">
        {/* ✅ Animated LIFF Logo */}
        <div className="mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-4xl">📱</span>
            </div>
            {/* ✅ Spinning border */}
            <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-transparent border-t-green-400 border-r-blue-400 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* ✅ Loading Text */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white mb-2">
            กำลังเข้าสู่ระบบ LINE
          </h2>
          <p className="text-green-300 text-lg animate-pulse">
            กำลังตรวจสอบสิทธิ์การเข้าถึง...
          </p>

          {/* ✅ Progress dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* ✅ Additional info */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <p className="text-green-200 text-sm">
            🔐 กำลังเชื่อมต่อกับ LINE LIFF
          </p>
          <p className="text-blue-200 text-xs mt-1">โปรดรอสักครู่...</p>
        </div>
      </div>
    </div>
  );
}

export default function RootLayoutClient(props) {
  const { children } = props;
  const pathname = usePathname();
  const { isLiffApp, isLoading } = useLiffGuest();

  const isLogin = pathname === "/login" || pathname === "/login/internal";

  // ✅ Show LIFF loading screen when LIFF is initializing
  if (isLiffApp && isLoading) {
    return <LiffLoadingScreen />;
  }

  // ✅ For login pages, don't show header
  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <main className="flex-1 flex flex-col bg-main-900 w-screen h-screen">
        <Header />
        <div className="flex p-0 sm:p-4 mx-auto md:p-6">{children}</div>
      </main>
    </>
  );
}
