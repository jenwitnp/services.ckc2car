"use client";

import React from "react";
import { useParams, notFound } from "next/navigation";
import { extractCarIdFromSlug } from "@/app/utils/urlUtils";
import { useCarDetail } from "@/app/hooks/useCarDetail";
import {
  Loader2,
  AlertCircle,
  Cpu,
  AlignLeft,
  Edit,
  MapPin,
  Calendar,
  Fuel,
  Settings,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Star,
  Phone,
  MessageCircle,
} from "lucide-react";
import { CarGallery } from "@/app/components/cars/CarGallery";
import { CarSpecs } from "@/app/components/cars/CarSpecs";
import { CarOffers } from "@/app/components/cars/CarOffers";
import { formatNumber } from "@/app/utils/formatNumber";

export default function CarDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const carId = extractCarIdFromSlug(slug);

  const { car, isLoading, isError, error } = useCarDetail(carId, {
    enabled: !!carId,
    includeRelated: false,
  });

  if (!carId) notFound();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-main-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-success-400 animate-spin mx-auto mb-4" />
          <p className="text-main-300 text-lg">กำลังโหลดข้อมูลรถยนต์...</p>
        </div>
      </div>
    );
  }

  if (isError || !car) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-main-900">
        <div className="text-center max-w-md mx-auto p-8 bg-main-800 rounded-2xl shadow-xl border border-main-700">
          <AlertCircle className="h-16 w-16 text-danger-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-main-100 mb-2">
            ไม่พบข้อมูลรถยนต์
          </h2>
          <p className="text-main-300 mb-6">
            {error?.message || "ขออภัย ไม่พบรถยนต์ที่คุณต้องการ"}
          </p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับหน้าก่อน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-900">
      {/* Header Navigation */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Gallery */}
            <div className="bg-main-800 rounded-2xl shadow-xl overflow-hidden border border-main-700">
              <CarGallery
                thumbnail={car.thumbnail}
                images={car.images}
                title={car.title}
              />
            </div>

            {/* Car Title & Basic Info */}
            <div className="bg-main-800 rounded-2xl shadow-xl p-6 border border-main-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center text-sm text-main-400 mb-2">
                    <span>{car.brand_name}</span>
                    <span className="mx-2">•</span>
                    <span>{car.model_name}</span>
                    <span className="mx-2">•</span>
                    <span>{car.years_car}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-main-100 mb-2">
                    {car.title}
                  </h1>
                  <div className="text-3xl md:text-4xl font-bold text-success-400">
                    ฿{formatNumber(car.price)}
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex text-warning-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-main-300 text-sm ml-2">(4.8)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-main-400 mb-1">รหัสรถ</div>
                  <div className="font-semibold text-main-100 bg-main-700 px-3 py-1 rounded-lg">
                    {car.no_car}
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Highlights */}
            {(car.featured || car.marker) && (
              <div className="bg-main-800 rounded-2xl shadow-xl p-6 border border-main-700">
                <h2 className="text-xl font-bold text-main-100 mb-4 flex items-center">
                  <Star className="w-6 h-6 mr-3 text-warning-400" />
                  จุดเด่นพิเศษ
                </h2>
                <div className="space-y-3">
                  {car.featured && (
                    <div className="bg-gradient-to-r from-primary-900/50 to-primary-800/50 border border-primary-600 rounded-lg p-4">
                      <div className="font-medium text-primary-200">
                        {car.featured}
                      </div>
                    </div>
                  )}
                  {car.marker && (
                    <div className="bg-gradient-to-r from-success-900/50 to-success-800/50 border border-success-600 rounded-lg p-4">
                      <div className="font-medium text-success-200">
                        {car.marker}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Car Specifications */}
            <div className="bg-main-800 rounded-2xl shadow-xl overflow-hidden border border-main-700">
              <div className="px-6 py-4 border-b border-main-700 bg-main-900/50">
                <h2 className="text-xl font-bold text-main-100 flex items-center">
                  <Cpu className="w-6 h-6 mr-3 text-primary-400" />
                  รายละเอียดรถยนต์
                </h2>
              </div>
              <div className="p-6">
                <CarSpecs specs={car} />
                <div className="flex justify-start items-center gap-2 mt-6">
                  <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  <div>
                    <p className="text-sm text-main-500 dark:text-main-400">
                      รถจอดสาขา
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {car.branch_name || "ไม่ระบุ"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {car.detail && car.detail.trim() !== "" && (
              <div className="bg-main-800 rounded-2xl shadow-xl overflow-hidden border border-main-700">
                <div className="px-6 py-4 border-b border-main-700 bg-main-900/50">
                  <h2 className="text-xl font-bold text-main-100 flex items-center">
                    <AlignLeft className="w-6 h-6 mr-3 text-info-400" />
                    รายละเอียดเพิ่มเติม
                  </h2>
                </div>
                <div className="p-6">
                  <div className="prose max-w-none text-main-200">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {car.detail}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Seller Notes */}
            {car.seller_notes && (
              <div className="bg-main-800 rounded-2xl shadow-xl overflow-hidden border border-main-700">
                <div className="px-6 py-4 border-b border-main-700 bg-main-900/50">
                  <h2 className="text-xl font-bold text-main-100 flex items-center">
                    <Edit className="w-6 h-6 mr-3 text-warning-400" />
                    หมายเหตุจากผู้ขาย
                  </h2>
                </div>
                <div className="p-6">
                  <div className="prose max-w-none text-main-200">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {car.seller_notes}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Offers & Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-main-800 rounded-2xl shadow-xl overflow-hidden border border-main-700">
                <CarOffers />
              </div>

              {/* Contact CTA */}
              <div className="bg-gradient-to-br from-success-600 to-success-700 rounded-2xl p-6 text-white shadow-xl border border-success-500">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  สนใจรถคันนี้?
                </h3>
                <p className="text-success-100 mb-4">
                  ติดต่อเราเพื่อขอข้อมูลเพิ่มเติม
                </p>
                <div className="space-y-3">
                  <button className="w-full bg-white text-success-700 font-semibold py-3 rounded-lg hover:bg-success-50 transition-colors flex items-center justify-center">
                    <Phone className="w-5 h-5 mr-2" />
                    โทรหาเรา
                  </button>
                  <button className="w-full border border-white text-white font-semibold py-3 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    ส่งข้อความ
                  </button>
                </div>
              </div>

              {/* Dealer Info Card */}
              <div className="bg-main-800 rounded-2xl shadow-xl p-6 border border-main-700">
                <h3 className="text-lg font-bold text-main-100 mb-3">
                  ข้อมูลผู้ขาย
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-main-400">สาขา:</span>
                    <span className="text-main-100">
                      {car.branch_name || "ไม่ระบุ"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-main-400">เปิดทำการ:</span>
                    <span className="text-main-100">จ-ส 9:00-18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-main-400">การรับประกัน:</span>
                    <span className="text-success-400">มีการรับประกัน</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
