"use client";
import { useState } from "react";
import Image from "next/image";

const CarListCard = ({
  car,
  layout = "horizontal", // 'horizontal' or 'vertical'
  className = "",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Default car data if not provided
  const defaultCar = {
    id: 1,
    name: "2018 TOYOTA COROLLA ALTIS 1.6 G",
    model: "[9P0964]",
    year: 2018,
    price: 399000,
    monthlyPayment: 6679.93,
    image: "/public/images/placeholder-car.jpg",
    transmission: "AT",
    rating: 5,
    badgeColor: "orange",
  };

  const carData = car || defaultCar;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  const formatMonthly = (monthly) => {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monthly);
  };

  const handleViewDetails = () => {
    console.log("View details for car:", carData.id);
    // Handle navigation to car detail page
  };

  if (layout === "vertical") {
    return (
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}
      >
        {/* Image Section */}
        <div className="relative h-48">
          <div className="relative w-full h-full bg-gray-200 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl text-gray-400">🚗</div>
              </div>
            )}
            <Image
              src={carData.image}
              alt={carData.name}
              fill
              className={`object-cover ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 left-2">
            <div className="bg-orange-500 text-white rounded-md px-2 py-1 text-sm font-bold flex items-center gap-1">
              <span>{carData.rating}</span>
              <span className="text-xs">ดาวเฉลี่ย 5.0</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Car Name and Model */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-800 leading-tight">
              {carData.name}
            </h3>
            <p className="text-sm text-blue-600 font-medium">{carData.model}</p>
          </div>

          {/* Transmission Badge */}
          <div className="mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {carData.transmission}
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            <div className="text-xl font-bold text-gray-900">
              {formatPrice(carData.price)}.-
            </div>
            <div className="text-sm text-gray-600">
              ผ่อนเริ่มต้น {formatMonthly(carData.monthlyPayment)} /เดือน*
            </div>
          </div>

          {/* View Details Button */}
          <button
            onClick={handleViewDetails}
            className="w-full text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors duration-200 border border-orange-300 hover:border-orange-500 py-2 rounded-md"
          >
            ดูรายละเอียด
          </button>
        </div>
      </div>
    );
  }

  // Horizontal Layout (Default)

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}
    >
      <div className="flex">
        {/* Image Section */}
        <div className="relative w-48 h-40 flex-shrink-0">
          <div className="relative w-full h-full bg-gray-200 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl text-gray-400">🚗</div>
              </div>
            )}
            <Image
              src={carData.image}
              alt={carData.name}
              fill
              className={`object-cover ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              sizes="192px"
            />
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 left-2">
            <div className="bg-orange-500 text-white rounded-md px-2 py-1 text-sm font-bold flex items-center gap-1">
              <span>{carData.rating}</span>
              <span className="text-xs">ดาวเฉลี่ย 5.0</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          <div className="flex flex-col h-full">
            {/* Car Name and Model */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-gray-800 leading-tight">
                {carData.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium">
                {carData.model}
              </p>
            </div>

            {/* Transmission Badge */}
            <div className="mb-3">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {carData.transmission}
              </span>
            </div>

            {/* Price */}
            <div className="mb-3">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(carData.price)}.-
              </div>
              <div className="text-sm text-gray-600">
                ผ่อนเริ่มต้น {formatMonthly(carData.monthlyPayment)} /เดือน*
              </div>
            </div>

            {/* View Details Button */}
            <div className="mt-auto">
              <button
                onClick={handleViewDetails}
                className="text-orange-500 hover:text-orange-600 font-medium text-sm transition-colors duration-200 border-b border-orange-300 hover:border-orange-500"
              >
                ดูรายละเอียด
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarListCard;
