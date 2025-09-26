"use client";
import { useState } from "react";
import SectionHeader from "@/app/(public)/components/ui/SectionHeader";
import CarListCard from "@/app/(public)/components/ui/CarListCard";

const CarListingSection = () => {
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  // Extended car data matching your image style
  const carListing = [
    {
      id: 1,
      name: "2018 TOYOTA COROLLA ALTIS 1.6 G",
      model: "[9P0964]",
      year: 2018,
      price: 399000,
      monthlyPayment: 6679.93,
      image: "/public/images/placeholder-car.jpg",
      transmission: "AT",
      rating: 5,
    },
    {
      id: 2,
      name: "2022 MITSUBISHI XPANDER 1.5 GT",
      model: "[9P0965]",
      year: 2022,
      price: 579000,
      monthlyPayment: 9693.43,
      image: "/public/images/placeholder-car.jpg",
      transmission: "AT",
      rating: 5,
    },
    {
      id: 3,
      name: "2020 TOYOTA CAMRY 2.0 G",
      model: "[1C0001]",
      year: 2020,
      price: 699000,
      monthlyPayment: 11702.43,
      image: "/public/images/placeholder-car.jpg",
      transmission: "AT",
      rating: 5,
    },
    {
      id: 4,
      name: "2023 HONDA CIVIC 1.5 TURBO",
      model: "[9H5432]",
      year: 2023,
      price: 890000,
      monthlyPayment: 14850.5,
      image: "/public/images/placeholder-car.jpg",
      transmission: "AT",
      rating: 5,
    },
    {
      id: 5,
      name: "2021 MAZDA CX-3 2.0 SP",
      model: "[7M9876]",
      year: 2021,
      price: 650000,
      monthlyPayment: 10850.75,
      image: "/public/images/placeholder-car.jpg",
      transmission: "AT",
      rating: 5,
    },
    {
      id: 6,
      name: "2022 NISSAN ALMERA 1.0 TURBO",
      model: "[4N1234]",
      year: 2022,
      price: 520000,
      monthlyPayment: 8675.25,
      image: "/public/images/placeholder-car.jpg",
      transmission: "AT",
      rating: 5,
    },
  ];

  const handleViewAllClick = () => {
    console.log("Navigate to full car listing page");
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 lg:mb-8">
          <div>
            <SectionHeader
              title="รถยนต์ทั้งหมด"
              subtitle="รถยนต์คุณภาพดีที่คัดสรรมาแล้ว พร้อมราคาที่เหมาะสม"
              showViewAll={true}
              viewAllText="ดูรถทั้งหมด"
              onViewAllClick={handleViewAllClick}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mt-4 md:mt-0">
            <button
              onClick={() => handleViewModeChange("grid")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              ตาราง
            </button>
            <button
              onClick={() => handleViewModeChange("list")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === "list"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              รายการ
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carListing.map((car) => (
              <CarListCard key={car.id} car={car} layout="vertical" />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="space-y-4">
            {carListing.map((car) => (
              <CarListCard key={car.id} car={car} layout="horizontal" />
            ))}
          </div>
        )}

        {/* Show More Button */}
        <div className="text-center mt-12">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200">
            โหลดรถเพิ่มเติม
          </button>
          <p className="text-gray-500 text-sm mt-2">แสดง 6 จาก 156 คัน</p>
        </div>
      </div>
    </section>
  );
};

export default CarListingSection;
