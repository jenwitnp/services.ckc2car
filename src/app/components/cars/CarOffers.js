"use client";

import React from "react";
import { Check } from "lucide-react";

// Special offers data array
const specialOffersData = [
  { id: 1, text: "โปรฯ ขับฟรี (3 เดือน)" },
  { id: 2, text: "โปรฯ ช่วยผ่อน 2,000 บาท 6 เดือน" },
  { id: 3, text: "ค่าภาษีประจำปี" },
  { id: 4, text: "ค่าประกันภัยรถยนต์(ชั้น 1 ) คุ้มครอง 1ปี" },
  { id: 5, text: "ค่าน้ำมัน" },
  { id: 6, text: "ค่าแบตเตอรี่ใหม่" },
  { id: 7, text: "ค่าประกันภัยรถยนต์(ชั้น 2 ) คุ้มครอง 1 ปี" },
  { id: 8, text: "โปรฯ ช่วยผ่อน 1,000 บาท (12เดือน)" },
  { id: 9, text: "โปรฯ ออกรถเปลี่ยนแบ็กซื้อ" },
  { id: 10, text: "ติดฟิล์มใหม่" },
  { id: 11, text: "เติมน้ำมันเพิ่ม" },
  { id: 12, text: "ชุดแต่งรถ" },
  { id: 13, text: "โปรช่วยจ่ายค่าจอด 3,000 บาท ( 2 เดือน)" },
  { id: 14, text: "โปร ช่วยผ่อนจอด 6 จอด ( จอดละ 1,000 )" },
  { id: 15, text: "ตรวจสภาพ" },
  { id: 16, text: "โปรช่วยจ่ายจอด" },
  { id: 17, text: "แถมเงินกลับบ้านสูงสุด 20,000 บาท" },
  { id: 18, text: "บริการส่งรถ" },
  { id: 19, text: "ค่าใช้จ่ายอื่นๆ" },
  { id: 20, text: "โปรช่วยผ่อนค่าจอด 1,500 (6 เดือน)" },
  { id: 21, text: "โปรช่วยผ่อนค่าจอด 1,500 (12 เดือน)" },
  { id: 22, text: "ประกันเครื่อง GPS" },
  { id: 23, text: "รับประกันทุกชิ้นส่วนนาน 45 วัน" },
  { id: 24, text: "ฟรีบริการฉุกเฉิน + รถสไลด์ 24 ชั่วโมง นาน 1 ปี" },
  { id: 25, text: "โปรฯ ช่วยผ่อน 2,000 บาท 8 เดือน" },
  { id: 26, text: "ค่าดำเนินการโอนกรรมสิทธิ์" },
  { id: 27, text: "รับประกันรถสไลด์ 1,999" },
];

export function CarOffers({
  selectedOffers = [5, 6, 7, 11, 12, 15, 18, 22, 24],
  onSelect,
  readOnly = true,
}) {
  const handleToggleOffer = (offerId) => {
    if (readOnly) return;

    if (selectedOffers.includes(offerId)) {
      onSelect(selectedOffers.filter((id) => id !== offerId));
    } else {
      onSelect([...selectedOffers, offerId]);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="text-xl font-bold text-red-500">ข้อเสนอพิเศษ</h3>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {specialOffersData.map((offer) => (
            <div
              key={offer.id}
              className={`flex items-center gap-2 text-sm ${
                readOnly && !selectedOffers.includes(offer.id)
                  ? "opacity-60"
                  : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border ${
                  selectedOffers.includes(offer.id)
                    ? "bg-amber-500 border-amber-600 text-black"
                    : "bg-gray-800 border-gray-700 text-gray-400"
                } flex items-center justify-center ${
                  !readOnly ? "cursor-pointer" : ""
                }`}
                onClick={() => handleToggleOffer(offer.id)}
              >
                {selectedOffers.includes(offer.id) && (
                  <Check className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-${
                  selectedOffers.includes(offer.id) ? "white" : "gray-300"
                }`}
              >
                {offer.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
