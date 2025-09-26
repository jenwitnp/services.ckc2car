"use client";
import { Heart, Eye, Calendar, Fuel, Settings, Phone } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

const CarCard = ({
  car,
  layout = "vertical", // 'vertical' or 'horizontal'
  showContactButton = true,
  className = "",
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Default car data if not provided
  const defaultCar = {
    id: 1,
    name: "Toyota Camry",
    year: 2023,
    price: 1250000,
    downPayment: 125000,
    image: "/public/images/placeholder-car.jpg",
    mileage: "15,000 km",
    fuelType: "เบนซิน",
    transmission: "อัตโนมัติ",
    location: "กรุงเทพมหานคร",
    isPromoted: false,
    tags: [],
    views: 1250,
  };

  const carData = car || defaultCar;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Handle contact logic
    console.log("Contact clicked for car:", carData.id);
  };

  const handleCardClick = () => {
    // Handle navigation to car detail
    console.log("Navigate to car detail:", carData.id);
  };

  if (layout === "horizontal") {
    return (
      <div
        className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group ${className}`}
        onClick={handleCardClick}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="relative sm:w-64 h-48 sm:h-auto">
            <div className="relative w-full h-full rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none overflow-hidden bg-gray-200">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl text-gray-400">🚗</div>
                </div>
              )}
              <Image
                src={carData.image}
                alt={carData.name}
                fill
                className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(false)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
              >
                <Heart
                  className={`w-4 h-4 ${
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                  }`}
                />
              </button>

              {/* Promoted Badge */}
              {carData.isPromoted && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                  โปรโมชัน
                </div>
              )}

              {/* Views */}
              <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {carData.views}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                  {carData.name}
                </h3>
                <p className="text-gray-600 text-sm">{carData.location}</p>
              </div>

              {/* Specs */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {carData.year}
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  {carData.mileage}
                </div>
                <div className="flex items-center gap-1">
                  <Fuel className="w-4 h-4" />
                  {carData.fuelType}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="mt-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      ฿{formatPrice(carData.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ดาวน์ ฿{formatPrice(carData.downPayment)}
                    </div>
                  </div>

                  {showContactButton && (
                    <button
                      onClick={handleContactClick}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 justify-center sm:justify-start"
                    >
                      <Phone className="w-4 h-4" />
                      ติดต่อ
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vertical Layout (Default)
  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-48 rounded-t-xl overflow-hidden bg-gray-200">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl text-gray-400">🚗</div>
          </div>
        )}
        <Image
          src={carData.image}
          alt={carData.name}
          fill
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>

        {/* Promoted Badge */}
        {carData.isPromoted && (
          <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
            โปรโมชัน
          </div>
        )}

        {/* Views */}
        <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {carData.views}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors">
            {carData.name}
          </h3>
          <p className="text-gray-600 text-sm">{carData.location}</p>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {carData.year}
          </div>
          <div className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            {carData.mileage}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Fuel className="w-4 h-4" />
            {carData.fuelType}
          </div>
          <span>•</span>
          <span>{carData.transmission}</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-xl font-bold text-red-600">
            ฿{formatPrice(carData.price)}
          </div>
          <div className="text-sm text-gray-600">
            ดาวน์ ฿{formatPrice(carData.downPayment)}
          </div>
        </div>

        {/* Contact Button */}
        {showContactButton && (
          <button
            onClick={handleContactClick}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 justify-center"
          >
            <Phone className="w-4 h-4" />
            ติดต่อสอบถาม
          </button>
        )}
      </div>
    </div>
  );
};

export default CarCard;
