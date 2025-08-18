"use client";

import React from "react";
import { CarGallery } from "@/app/components/cars/CarGallery";
import { CarSpecs } from "@/app/components/cars/CarSpecs";
import { formatNumber } from "@/app/utils/formatNumber";
import { fetchData } from "@/app/services/supabase/query";
import { CarOffers } from "@/app/components/cars/CarOffers";
import { useQuery } from "@tanstack/react-query";

// Import Lucide icons
import { Cpu, AlignLeft, Edit, Loader2 } from "lucide-react";

// This would come from your API in a real implementation
import carData from "@/app/mock/carDetail";

function DetailPage({ params }) {
  const { data: apiCar, isLoading } = useQuery({
    queryKey: ["cars", params?.id],
    queryFn: () =>
      fetchData("cars_full_view", {
        filters: {
          id: 5214,
        },
        single: true,
      }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-16 w-16 text-main-500 animate-spin" />
      </div>
    );
  }

  // Use API data if available, otherwise fallback to mock data
  const car = apiCar.data || carData;

  return (
    <div>
      {/* Car title and price (mobile) */}
      <div className="md:hidden p-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>{car.brand_name}</span>
          <span className="mx-2">•</span>
          <span>{car.model_name}</span>
          <span className="mx-2">•</span>
          <span>{car.years_car}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {car.title}
        </h1>
        <div className="text-2xl font-bold text-secondary-500">
          ราคา {formatNumber(car.price)} บาท
        </div>
      </div>

      {/* Car gallery */}
      <CarGallery
        thumbnail={car.thumbnail}
        images={car.images}
        title={car.title}
      />

      {/* Content grid for desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-2">
        {/* Left column - Car details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Car title and price (desktop) */}
          <div className="hidden md:block bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>{car.brand_name}</span>
              <span className="mx-2">•</span>
              <span>{car.model_name}</span>
              <span className="mx-2">•</span>
              <span>{car.years_car}</span>
              <span className="mx-2">•</span>
              <span>รหัส: {car.no_car}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {car.title}
            </h1>
            <div className="text-3xl font-bold text-secondary-500">
              ราคา {formatNumber(car.price)} บาท
            </div>
          </div>

          {/* spec block */}
          <div className="space-y-8">
            {/* Features section */}
            <div className="bg-white dark:bg-gray-800/60 rounded-lg overflow-hidden shadow-sm">
              <div className="px-6 bg-main-800 py-4">
                <div>{car.featured ?? car.featured}</div>
                <div>{car.marker ?? car.marker}</div>
              </div>
            </div>

            {/* Specifications section */}
            <div className="bg-white dark:bg-gray-800/60 rounded-lg overflow-hidden shadow-sm">
              <div className="border-b border-main-200 dark:border-main-700 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-amber-500" />
                  รายละเอียดรถ
                </h2>
              </div>
              <div className="p-6">
                <CarSpecs specs={car} />
              </div>
            </div>

            {/* Description section */}
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
                    <p>{car.detail}</p>
                  </div>
                </div>
              </div>
            )}
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
                    <p>{car.seller_notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Contact and dealer info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Special offers */}
          <div className="bg-white dark:bg-gray-800/60 rounded-lg shadow-sm overflow-hidden">
            <CarOffers />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPage;
