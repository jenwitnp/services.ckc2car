"use client";

import React from "react";
import { CarGallery } from "@/app/components/cars/CarGallery";
import { CarSpecs } from "@/app/components/cars/CarSpecs";
import { formatNumber } from "@/app/utils/formatNumber";
import { CarOffers } from "@/app/components/cars/CarOffers";
import { useCarDetail } from "@/app/hooks/useCarDetail";
import { extractCarIdFromSlug } from "@/app/utils/urlUtils";
import Link from "next/link";

// Import Lucide icons
import { Cpu, AlignLeft, Edit, Loader2, AlertCircle } from "lucide-react";

function DetailPage({ params }) {
  // ✅ Extract car ID from URL slug
  const carId = extractCarIdFromSlug(params?.slug || params?.id);

  // ✅ Use enhanced car detail hook (without incrementViews)
  const {
    car,
    relatedCars,
    isLoading,
    isError,
    error,
    isAvailable,
    hasImages,
    hasVideo,
    hasPromotion,
    financingAvailable,
    helpers,
  } = useCarDetail(carId, {
    includeRelated: true,
    enabled: !!carId,
  });

  // ✅ Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-main-500 animate-spin mx-auto mb-4" />
          <p className="text-main-600">กำลังโหลดข้อมูลรถ...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (isError || !car) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ไม่พบข้อมูลรถ
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || "ขออภัย ไม่พบรถที่คุณกำลังค้นหา"}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-main-600 text-white px-6 py-2 rounded-lg hover:bg-main-700 transition-colors"
          >
            กลับหน้าก่อนหน้า
          </button>
        </div>
      </div>
    );
  }

  // ✅ Car not available
  if (!isAvailable) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">
            รถคันนี้ไม่พร้อมขาย
          </h2>
          <p className="text-yellow-700">
            รถคันนี้อาจถูกขายไปแล้ว หรือไม่พร้อมให้บริการในขณะนี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* ✅ Car title and price (mobile) */}
      <div className="md:hidden bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>{car.brand_name}</span>
          <span className="mx-2">•</span>
          <span>{car.model_name}</span>
          <span className="mx-2">•</span>
          <span>{car.years_car}</span>
          {hasPromotion && (
            <>
              <span className="mx-2">•</span>
              <span className="text-red-500 font-medium">โปรโมชั่น</span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {car.title}
        </h1>
        <div className="text-2xl font-bold text-secondary-500">
          ราคา {helpers.getFormattedPrice()} บาท
        </div>
        {financingAvailable && (
          <div className="text-sm text-gray-600 mt-1">
            ผ่อน: ฿
            {parseInt(car._metadata?.finance?.ins_price || 0).toLocaleString(
              "th-TH"
            )}
            /เดือน
          </div>
        )}
      </div>

      {/* ✅ Car gallery with enhanced features */}
      <CarGallery
        images={car.images || []}
        mainImage={helpers.getMainImage()}
        title={car._metadata?.full_title || car.title}
        hasVideo={hasVideo}
        videoUrl={car.youtube}
        imageCount={car._metadata?.image_count || 0}
      />

      {/* ✅ Content grid for desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Left column - Car details */}
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ Car title and price (desktop) */}
          <div className="hidden md:block bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>{car.brand_name}</span>
              <span className="mx-2">•</span>
              <span>{car.model_name}</span>
              <span className="mx-2">•</span>
              <span>{car.years_car}</span>
              <span className="mx-2">•</span>
              <span>รหัส: {car.no_car}</span>
              {hasPromotion && (
                <>
                  <span className="mx-2">•</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                    โปรโมชั่น
                  </span>
                </>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {car._metadata?.full_title || car.title}
            </h1>
            <div className="text-3xl font-bold text-secondary-500">
              ราคา {helpers.getFormattedPrice()} บาท
            </div>
            {financingAvailable && (
              <div className="text-lg text-gray-600 mt-2">
                ผ่อน: ฿
                {parseInt(
                  car._metadata?.finance?.ins_price || 0
                ).toLocaleString("th-TH")}
                /เดือน
              </div>
            )}
            {car._metadata?.vat_text && (
              <div className="mt-2">
                <span className="bg-success-100 text-success-700 px-3 py-1 rounded-full text-sm font-medium">
                  {car._metadata.vat_text}
                </span>
              </div>
            )}
          </div>

          {/* ✅ Enhanced features and promotions */}
          {(car._metadata?.features || car._metadata?.promotion) && (
            <div className="bg-white dark:bg-gray-800/60 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-main-800 px-6 py-4">
                <h2 className="text-lg font-medium text-white">
                  จุดเด่นและโปรโมชั่น
                </h2>
              </div>
              <div className="p-6 space-y-3">
                {car._metadata?.features && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-1">จุดเด่น</h3>
                    <p className="text-blue-700 text-sm">
                      {car._metadata.features}
                    </p>
                  </div>
                )}
                {car._metadata?.promotion && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h3 className="font-medium text-red-800 mb-1">
                      โปรโมชั่นพิเศษ
                    </h3>
                    <p className="text-red-700 text-sm">
                      {car._metadata.promotion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ Enhanced Specifications section */}
          <div className="bg-white dark:bg-gray-800/60 rounded-lg overflow-hidden shadow-sm">
            <div className="border-b border-main-200 dark:border-main-700 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <Cpu className="w-5 h-5 mr-2 text-amber-500" />
                รายละเอียดรถ
              </h2>
            </div>
            <div className="p-6">
              <CarSpecs specs={helpers.getSpecs() || car} />
            </div>
          </div>

          {/* ✅ Enhanced Description section */}
          {car.detail && car.detail.trim() !== "" && (
            <div className="bg-white dark:bg-gray-800/60 rounded-lg overflow-hidden shadow-sm">
              <div className="border-b border-main-200 dark:border-main-700 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <AlignLeft className="w-5 h-5 mr-2 text-amber-500" />
                  รายละเอียดเพิ่มเติม
                </h2>
              </div>
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{car.detail}</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Seller notes */}
          {car.seller_notes && (
            <div className="bg-white dark:bg-gray-800/60 rounded-lg overflow-hidden shadow-sm">
              <div className="border-b border-main-200 dark:border-main-700 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-amber-500" />
                  หมายเหตุจากผู้ขาย
                </h2>
              </div>
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{car.seller_notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Contact and dealer info */}
        <div className="space-y-6 lg:col-span-2">
          {/* ✅ Enhanced Special offers */}
          <div className="bg-white dark:bg-gray-800/60 rounded-lg shadow-sm overflow-hidden">
            <CarOffers
              car={car}
              financingAvailable={financingAvailable}
              financeData={helpers.getFinanceData()}
            />
          </div>

          {/* ✅ Car Statistics */}
          <div className="bg-white dark:bg-gray-800/60 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              สถิติการดู
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-main-600">
                  {car._metadata?.view_count?.toLocaleString("th-TH") || 0}
                </div>
                <div className="text-sm text-gray-600">ครั้ง</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-main-600">
                  {helpers.getCarAge() || 0}
                </div>
                <div className="text-sm text-gray-600">ปี</div>
              </div>
            </div>
          </div>

          {/* ✅ Related Cars */}
          {relatedCars && relatedCars.length > 0 && (
            <div className="bg-white dark:bg-gray-800/60 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                รถที่คล้ายกัน
              </h3>
              <div className="space-y-3">
                {relatedCars.slice(0, 3).map((relatedCar) => (
                  <div
                    key={relatedCar.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Link href={getCarDetailUrl(relatedCar)} className="block">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {relatedCar._metadata?.full_title || relatedCar.title}
                      </h4>
                      <p className="text-success-600 font-bold text-sm">
                        ฿
                        {relatedCar._metadata?.formatted_price ||
                          parseInt(relatedCar.price || 0).toLocaleString(
                            "th-TH"
                          )}
                      </p>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
