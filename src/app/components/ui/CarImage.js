"use client";

import React, { useState } from "react";
import Image from "next/image";

export function CarImage({
  src,
  alt,
  className = "",
  fill = true,
  sizes,
  priority = false,
  ...props
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // ✅ Get the appropriate image source
  const getImageSrc = () => {
    if (imageError || !src) {
      return "/images/placeholder-car.jpg";
    }
    return src;
  };

  const currentSrc = getImageSrc();

  return (
    <>
      {/* Loading state */}
      {imageLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-main-200 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-main-400"></div>
        </div>
      )}

      <Image
        src={currentSrc}
        alt={alt || "รถยนต์"}
        fill={fill}
        className={`${className} ${
          imageLoading && !imageError ? "opacity-0" : "opacity-100"
        } transition-opacity duration-300`}
        sizes={sizes}
        priority={priority}
        unoptimized={imageError || currentSrc.includes("placeholder")}
        onError={(e) => {
          console.warn(`Failed to load image: ${src}`);
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => {
          setImageLoading(false);
        }}
        {...props}
      />
    </>
  );
}
