"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useLiffAutoLogin } from "@/app/hooks/useLiffAutoLogin";

const rootUrl = process.env.NEXT_PUBLIC_CKC_URL || "";

export function CarGallery({ images, thumbnail, title, carData }) {
  const [mainImage, setMainImage] = useState(thumbnail);
  const scrollContainerRef = useRef(null);
  const { isLiffApp, sendMessage, closeWindow } = useLiffAutoLogin();

  // Parse image data safely
  let imagesData = [];
  try {
    imagesData = images ? JSON.parse(images) : [];
  } catch (error) {
    imagesData = [];
  }

  // Handle thumbnail click
  const handleThumbnailClick = (imagePath) => {
    setMainImage(imagePath);
  };

  // LIFF-specific features
  const handleShareCar = async () => {
    if (isLiffApp && carData) {
      const message = `🚗 ${carData.brand} ${carData.model} ${
        carData.year
      }\n💰 ราคา: ${Number(carData.price).toLocaleString()} บาท\n📍 สาขา: ${
        carData.branch
      }\n\n${window.location.href}`;

      const success = await sendMessage(message);
      if (success) {
        alert("แชร์ข้อมูลรถเรียบร้อย!");
      }
    }
  };

  const handleInquiry = async () => {
    if (isLiffApp && carData) {
      const message = `สอบถามรถ: ${carData.brand} ${carData.model} ${
        carData.year
      }\nราคา: ${Number(carData.price).toLocaleString()} บาท`;

      const success = await sendMessage(message);
      if (success) {
        closeWindow();
      }
    }
  };

  return (
    <div className="relative">
      {/* Main image - responsive aspect ratio */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] lg:aspect-[21/9] m-4 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-lg shadow-sm mb-2">
        <Image
          src={`${rootUrl}${mainImage || thumbnail}`}
          alt={`${title} - Main view`}
          fill
          className="object-cover object-center rounded-lg"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 70vw, 60vw"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/car-placeholder.jpg";
          }}
        />

        {/* Image counter */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
          {imagesData.length} รูป
        </div>

        {/* LIFF Action Buttons */}
        {isLiffApp && (
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={handleShareCar}
              className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-600"
              title="แชร์รถคันนี้"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </button>
            <button
              onClick={handleInquiry}
              className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
              title="สอบถามรถคันนี้"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Thumbnail gallery */}
      <div className="relative px-4 py-2">
        <div
          ref={scrollContainerRef}
          className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1"
          style={{ scrollbarWidth: "thin", msOverflowStyle: "none" }}
        >
          {imagesData.length > 0 ? (
            imagesData.map((image, index) => {
              const thumbnailPath = `/uploads/posts/thumbnail/${image.image}`;
              const isActive = mainImage === thumbnailPath;
              return (
                <button
                  key={image.id || index}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md transition-all ${
                    isActive
                      ? "ring-2 ring-amber-500 shadow-lg scale-105"
                      : "ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-amber-400"
                  }`}
                  onClick={() => handleThumbnailClick(thumbnailPath)}
                  aria-label={`ดูรูปที่ ${index + 1}`}
                >
                  <Image
                    src={`${rootUrl}${thumbnailPath}`}
                    alt={`${title} - Thumbnail ${index + 1}`}
                    fill
                    className={`object-cover rounded-md transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-80 hover:opacity-100"
                    }`}
                    sizes="64px"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/car-placeholder.jpg";
                    }}
                  />
                  {isActive && (
                    <div className="absolute inset-0 border-2 border-amber-500 rounded-md pointer-events-none"></div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="w-full py-4 text-center text-gray-500">
              No additional images available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
