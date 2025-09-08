"use client";

import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/Card";

export function LoginHeader() {
  return (
    <CardHeader className="text-center pb-4">
      {/* Logo/Brand */}
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
          <span className="text-white font-bold text-xl">C</span>
        </div>
      </div>

      <CardTitle className="text-2xl text-main-900">เข้าสู่ระบบ</CardTitle>
      <CardDescription className="text-main-600">
        CKC Car Services - ระบบจัดการรถยนต์
      </CardDescription>
    </CardHeader>
  );
}
