"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Gauge,
  Fuel,
  Settings,
  MapPin,
  Eye,
  Play,
  Camera,
  Award,
  Zap,
} from "lucide-react";
import { getCarDetailUrl } from "@/app/utils/urlUtils";

// ✅ Memoize the component to prevent unnecessary re-renders
const CarCard = React.memo(
  ({ car, showRank = false, rank, fromAI = false }) => {
    const [imageError, setImageError] = useState(false);

    // ✅ Handle your complete data structure
    const {
      id,
      no_car,
      title,
      brand_name,
      model_name,
      car_type_title,
      price,
      years_car,
      used_mile,
      color,
      fuel_type,
      gear,
      branch_name,
      public_url,
      image_path,
      thumbnail,
      views,
      youtube,
      car_status,
      _metadata,
      images,
      marker,
      featured,
      vat_text,
      ins_price,
    } = car;

    // ✅ Early return if no ID (invalid data)
    if (!id) {
      console.warn("[CarCard] Invalid car data - no ID:", car);
      return null;
    }

    // ✅ Use metadata if available, with fallbacks
    const formattedPrice =
      _metadata?.formatted_price ||
      parseInt(price || 0).toLocaleString("th-TH");
    const formattedMileage =
      _metadata?.formatted_mileage ||
      parseInt(used_mile || 0).toLocaleString("th-TH");
    const carAge =
      _metadata?.car_age ||
      new Date().getFullYear() - (parseInt(years_car) || 0);
    const fullTitle =
      _metadata?.full_title || `${brand_name} ${model_name} ${title}`.trim();
    const imageCount =
      _metadata?.image_count || (Array.isArray(images) ? images.length : 0);
    const hasYoutube = _metadata?.has_youtube || !!youtube;
    const promotion = _metadata?.promotion || marker;
    const features = _metadata?.features || featured;

    // ✅ Generate SEO-friendly URL
    const carDetailUrl = getCarDetailUrl(car);

    // ✅ Enhanced image handling with base URL
    const getCarImage = () => {
      const baseImageUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";

      // Helper function to construct full URL
      const constructImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // If the image path already starts with http/https, return as is
        if (
          imagePath.startsWith("http://") ||
          imagePath.startsWith("https://")
        ) {
          return imagePath;
        }

        // If no base URL is configured, return the path as is
        if (!baseImageUrl) {
          return imagePath;
        }

        // Ensure the path starts with /
        const normalizedPath = imagePath.startsWith("/")
          ? imagePath
          : `/${imagePath}`;

        // Combine base URL with image path
        return `${baseImageUrl}${normalizedPath}`;
      };

      // Priority order for image selection
      if (!imageError && _metadata?.main_image) {
        return constructImageUrl(_metadata.main_image);
      }

      if (!imageError && image_path) {
        return constructImageUrl(image_path);
      }

      if (!imageError && thumbnail) {
        return constructImageUrl(thumbnail);
      }

      // Fallback to placeholder image
      return "/images/car-placeholder.jpg";
    };

    const carImage = getCarImage();

    // ✅ Status styling
    const getStatusStyle = () => {
      switch (car_status) {
        case "วางขาย":
          return "bg-success-100 text-success-800";
        case "จอง":
          return "bg-warning-100 text-warning-800";
        case "ขายแล้ว":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-main-100 text-main-800";
      }
    };

    return (
      <div
        className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative ${
          fromAI ? "ring-2 ring-success-200" : ""
        }`}
      >
        {/* ✅ AI Rank Badge */}
        {showRank && rank && (
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-gradient-to-r from-success-500 to-success-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              AI #{rank}
            </div>
          </div>
        )}

        {/* ✅ Promotion Badge */}
        {promotion && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              <Zap size={10} className="inline mr-1" />
              โปรโมชั่น
            </div>
          </div>
        )}

        {/* ✅ Car Image with Enhanced Features */}
        <div className="relative h-48 overflow-hidden group">
          <Link href={carDetailUrl} prefetch={true}>
            <Image
              src={carImage}
              alt={fullTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImageError(true)}
              priority={rank <= 3} // Prioritize top AI results
            />
          </Link>

          {/* Image overlay with badges */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Car Code Badge */}
          <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
            {no_car}
          </div>

          {/* Multiple badges in top row */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {/* Status Badge */}
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusStyle()}`}
            >
              {car_status}
            </span>
          </div>

          {/* Bottom row badges */}
          <div className="absolute bottom-2 right-2 flex gap-1">
            {/* Views Counter */}
            {views && parseInt(views) > 0 && (
              <div className="bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center">
                <Eye size={10} className="mr-1" />
                {parseInt(views).toLocaleString("th-TH")}
              </div>
            )}

            {/* Image Count */}
            {imageCount > 1 && (
              <div className="bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center">
                <Camera size={10} className="mr-1" />
                {imageCount}
              </div>
            )}

            {/* YouTube Badge */}
            {hasYoutube && (
              <div className="bg-red-600/90 text-white text-xs px-2 py-1 rounded flex items-center">
                <Play size={10} className="mr-1" />
                VDO
              </div>
            )}
          </div>
        </div>

        {/* Car Information */}
        <div className="p-4">
          {/* Title */}
          <Link href={carDetailUrl} prefetch={true}>
            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-success-600 transition-colors">
              {fullTitle}
            </h3>
          </Link>

          {/* Type and VAT Badges */}
          <div className="mb-3 flex gap-2 flex-wrap">
            <span className="inline-block bg-main-100 text-main-700 text-xs px-2 py-1 rounded-full">
              {car_type_title}
            </span>
            {vat_text && (
              <span className="inline-block bg-success-100 text-success-700 text-xs px-2 py-1 rounded-full">
                {vat_text}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="text-2xl font-bold text-success-600">
              ฿{formattedPrice}
            </div>
            {ins_price && parseInt(ins_price) > 0 && (
              <div className="text-sm text-gray-600">
                ผ่อน: ฿{parseInt(ins_price).toLocaleString("th-TH")}/เดือน
              </div>
            )}
          </div>

          {/* Car Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>ปี {years_car}</span>
            </div>

            <div className="flex items-center">
              <Gauge size={14} className="mr-2 text-gray-400" />
              <span>{formattedMileage} กม.</span>
            </div>

            <div className="flex items-center">
              <Fuel size={14} className="mr-2 text-gray-400" />
              <span>{fuel_type}</span>
            </div>

            <div className="flex items-center">
              <Settings size={14} className="mr-2 text-gray-400" />
              <span>{gear}</span>
            </div>
          </div>

          {/* Enhanced Additional Info */}
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            {color && (
              <div>
                สี: <span className="font-medium">{color}</span>
              </div>
            )}

            {branch_name && (
              <div className="flex items-center">
                <MapPin size={14} className="mr-1 text-gray-400" />
                <span className="truncate">{branch_name}</span>
              </div>
            )}

            {carAge > 0 && (
              <div className="text-xs text-gray-500">อายุรถ: {carAge} ปี</div>
            )}

            {/* Features */}
            {features && (
              <div className="flex items-start">
                <Award
                  size={14}
                  className="mr-1 text-gray-400 mt-0.5 flex-shrink-0"
                />
                <span className="text-xs line-clamp-2">{features}</span>
              </div>
            )}
          </div>

          {/* Promotion Message */}
          {promotion && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-xs text-red-700 font-medium line-clamp-2">
                🎉 {promotion}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-4">
            <Link
              href={carDetailUrl}
              prefetch={true}
              className="block w-full bg-success-500 hover:bg-success-600 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors"
            >
              ดูรายละเอียด
            </Link>
          </div>

          {/* AI Enhancement Badge */}
          {fromAI && (
            <div className="mt-2 text-center">
              <span className="inline-flex items-center text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full">
                🤖 แนะนำโดย AI
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ✅ Add display name for debugging
CarCard.displayName = "CarCard";

export default CarCard;
