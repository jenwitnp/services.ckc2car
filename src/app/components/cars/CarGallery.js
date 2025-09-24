"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, Loader2 } from "lucide-react";

const rootUrl = process.env.NEXT_PUBLIC_CKC_URL || "";

export function CarGallery({
  images = [], // From useCarImages hook
  loading = false,
  error = null,
  title = "Car Image",
  carId = null,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  // Set first image when images load
  useEffect(() => {
    if (images && images.length > 0) {
      // Try to find front image first, otherwise use first image
      const frontImageIndex = images.findIndex((img) => img.isFrontShow);
      setCurrentImageIndex(frontImageIndex >= 0 ? frontImageIndex : 0);
    }
  }, [images]);

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Handle navigation
  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isImageModalOpen) {
        if (e.key === "ArrowLeft") goToPrevious();
        if (e.key === "ArrowRight") goToNext();
        if (e.key === "Escape") setIsImageModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isImageModalOpen]);

  // Loading state
  if (loading) {
    return (
      <div className="relative aspect-[16/9] bg-main-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-secondary-500 animate-spin mx-auto mb-4" />
          <p className="text-main-300">กำลังโหลดรูปภาพ...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative aspect-[16/9] bg-main-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-main-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-main-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-main-300">ไม่สามารถโหลดรูปภาพได้</p>
          <p className="text-main-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // No images state
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-[16/9] bg-main-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-main-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-main-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-main-300">ไม่มีรูปภาพ</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <>
      <div className="relative">
        {/* Main image */}
        <div className="relative aspect-[16/9] bg-main-700 rounded-lg overflow-hidden group">
          <Image
            src={currentImage?.imageUrl}
            alt={`${title} - รูปที่ ${currentImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 70vw, 60vw"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/car-placeholder.jpg";
            }}
          />

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="รูปถัดไป"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Expand button */}
          <button
            onClick={() => setIsImageModalOpen(true)}
            className="absolute top-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="ขยายรูปภาพ"
          >
            <Expand className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Front image indicator */}
          {currentImage?.isFrontShow && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              รูปหน้า
            </div>
          )}
        </div>

        {/* Thumbnail gallery */}
        {images.length > 1 && (
          <div className="mt-4 px-4">
            <div
              ref={scrollContainerRef}
              className="flex space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-main-600 scrollbar-track-transparent pb-2"
            >
              {images.map((image, index) => (
                <button
                  key={image.id}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentImageIndex
                      ? "ring-2 ring-secondary-500 shadow-lg scale-105"
                      : "ring-1 ring-main-600 hover:ring-secondary-400 hover:scale-102"
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                  aria-label={`ดูรูปที่ ${index + 1}`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={`${title} - ภาพย่อที่ ${index + 1}`}
                    fill
                    className={`object-cover transition-opacity duration-200 ${
                      index === currentImageIndex
                        ? "opacity-100"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    sizes="80px"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/car-placeholder.jpg";
                    }}
                  />

                  {/* Front indicator */}
                  {image.isFrontShow && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}

                  {/* Active indicator */}
                  {index === currentImageIndex && (
                    <div className="absolute inset-0 border-2 border-secondary-500 rounded-lg pointer-events-none"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full screen modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
              aria-label="ปิด"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all z-10"
                  aria-label="รูปก่อนหน้า"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all z-10"
                  aria-label="รูปถัดไป"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Modal image */}
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Image
                src={currentImage?.imageUrl}
                alt={`${title} - รูปที่ ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/car-placeholder.jpg";
                }}
              />
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
