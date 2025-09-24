"use client";

import React from "react";
import { Check } from "lucide-react";
import { useOffers } from "@/app/hooks/cars/useOffers";
import Loading from "../ui/Loading";

export function CarOffers() {
  const { data: offers, isLoading } = useOffers();

  const handleToggleOffer = (offerId) => {
    if (readOnly) return;

    if (selectedOffers.includes(offerId)) {
      onSelect(selectedOffers.filter((id) => id !== offerId));
    } else {
      onSelect([...selectedOffers, offerId]);
    }
  };
  if (isLoading) return;
  return (
    <div className="bg-main-900 rounded-lg overflow-hidden border border-main-700">
      <div className="px-6 py-4 border-b border-main-700 bg-main-800/50">
        <h3 className="text-xl font-bold text-main-300 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
              clipRule="evenodd"
            />
          </svg>
          ข้อเสนอพิเศษสุดคุ้ม {offers.length} รายการ
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`flex items-center gap-3 text-sm transition-opacity duration-200`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 bg-main-800 border-main-600 text-main-200 hover:border-main-500 flex items-center justify-center `}
                onClick={() => handleToggleOffer(offer.id)}
              >
                <Check className="w-4 h-4" />
              </div>
              <span
                className={`leading-relaxed transition-colors duration-200 text-main-100 font-medium`}
              >
                {offer.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
