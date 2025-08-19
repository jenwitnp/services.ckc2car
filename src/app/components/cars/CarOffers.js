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
    <div className="bg-main-900 rounded-lg overflow-hidden border border-main-700">
      <div className="px-6 py-4 border-b border-main-700 bg-main-800/50">
        <h3 className="text-xl font-bold text-danger-500 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          ข้อเสนอพิเศษ
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {specialOffersData.map((offer) => (
            <div
              key={offer.id}
              className={`flex items-center gap-3 text-sm transition-opacity duration-200 ${
                readOnly && !selectedOffers.includes(offer.id)
                  ? "opacity-60"
                  : ""
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  selectedOffers.includes(offer.id)
                    ? "bg-main-500 border-main-600 text-main-900 shadow-lg shadow-main-500/30"
                    : "bg-main-800 border-main-600 text-main-400 hover:border-main-500"
                } flex items-center justify-center ${
                  !readOnly ? "cursor-pointer hover:scale-110" : ""
                }`}
                onClick={() => handleToggleOffer(offer.id)}
              >
                {selectedOffers.includes(offer.id) && (
                  <Check className="w-4 h-4" />
                )}
              </div>
              <span
                className={`leading-relaxed transition-colors duration-200 ${
                  selectedOffers.includes(offer.id)
                    ? "text-main-100 font-medium"
                    : "text-main-300"
                }`}
              >
                {offer.text}
              </span>
            </div>
          ))}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-main-700">
          <div className="text-sm text-main-400">
            เลือกแล้ว:
            <span className="ml-1 text-main-500 font-medium">
              {selectedOffers.length}
            </span>
            <span className="text-main-300">
              {" "}
              จาก {specialOffersData.length} รายการ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
