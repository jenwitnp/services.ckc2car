import { generateViewport as nextGenerateViewport } from "next";

// ✅ Move viewport to separate export
export function customViewport() {
  return {
    width: "device-width",
    initialScale: 1,
  };
}

// ✅ Keep only metadata here
export const metadata = {
  title: "ไม่พบหน้าที่ต้องการ | CKC2CAR",
  description: "ขออภัย ไม่พบหน้าที่คุณต้องการ",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-main-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-main-100">404</h1>
        <p className="text-xl text-main-400 mt-4">ไม่พบหน้าที่ต้องการ</p>
      </div>
    </div>
  );
}
