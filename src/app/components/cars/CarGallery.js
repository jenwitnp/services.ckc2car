"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const rootUrl = process.env.NEXT_PUBLIC_CKC_URL || "";

export function CarGallery({ images, thumbnail, title }) {
  const [mainImage, setMainImage] = useState(thumbnail);
  const scrollContainerRef = useRef(null);

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

  return (
    <div className="relative">
      {/* Main image - aspect ratio based */}
      <div className="relative aspect-[3/2]  m-4 bg-gray-200 dark:bg-gray-700 overflow-hidden rounded-lg shadow-sm mb-2">
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
      </div>

      {/* Thumbnails - horizontal scroll, touch friendly */}
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
