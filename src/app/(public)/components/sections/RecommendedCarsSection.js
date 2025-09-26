"use client";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "@/app/(public)/components/ui/SectionHeader";
import CarCard from "@/app/(public)/components/ui/CarCard";

const RecommendedCarsSection = () => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Sample car data
  const recommendedCars = [
    {
      id: 1,
      name: "Toyota Camry Hybrid",
      year: 2023,
      price: 1450000,
      downPayment: 145000,
      image: "/public/images/placeholder-car.jpg",
      mileage: "8,500 km",
      fuelType: "ไฮบริด",
      transmission: "อัตโนมัติ",
      location: "กรุงเทพมหานคร",
      isPromoted: true,
      views: 1850,
      tags: ["ประหยัดน้ำมัน", "รถใหม่"],
    },
    {
      id: 2,
      name: "Honda CR-V",
      year: 2022,
      price: 1280000,
      downPayment: 128000,
      image: "/public/images/placeholder-car.jpg",
      mileage: "15,200 km",
      fuelType: "เบนซิน",
      transmission: "อัตโนมัติ",
      location: "นนทบุรี",
      isPromoted: false,
      views: 1250,
      tags: ["SUV", "นำเข้า"],
    },
    {
      id: 3,
      name: "Mazda CX-5",
      year: 2023,
      price: 1350000,
      downPayment: 135000,
      image: "/public/images/placeholder-car.jpg",
      mileage: "5,800 km",
      fuelType: "เบนซิน",
      transmission: "อัตโนมัติ",
      location: "ปทุมธานี",
      isPromoted: true,
      views: 980,
      tags: ["ดีไซน์สวย", "ขับดี"],
    },
    {
      id: 4,
      name: "Nissan Almera",
      year: 2023,
      price: 589000,
      downPayment: 58900,
      image: "/public/images/placeholder-car.jpg",
      mileage: "12,000 km",
      fuelType: "เบนซิน",
      transmission: "อัตโนมัติ",
      location: "สมุทรปราการ",
      isPromoted: false,
      views: 750,
      tags: ["ราคาดี", "ประหยัด"],
    },
    {
      id: 5,
      name: "BMW 320i",
      year: 2022,
      price: 2150000,
      downPayment: 215000,
      image: "/public/images/placeholder-car.jpg",
      mileage: "18,500 km",
      fuelType: "เบนซิน",
      transmission: "อัตโนมัติ",
      location: "กรุงเทพมหานคร",
      isPromoted: false,
      views: 1520,
      tags: ["หรู", "สปอร์ต"],
    },
    {
      id: 6,
      name: "Toyota Vios",
      year: 2023,
      price: 679000,
      downPayment: 67900,
      image: "/public/images/placeholder-car.jpg",
      mileage: "6,200 km",
      fuelType: "เบนซิน",
      transmission: "อัตโนมัติ",
      location: "นครปฐม",
      isPromoted: true,
      views: 890,
      tags: ["ประหยัด", "นิยม"],
    },
  ];

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Width of one card plus gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleViewAllClick = () => {
    console.log("Navigate to recommended cars page");
    // Handle navigation
  };

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="รถแนะนำ"
          subtitle="รถยนต์คุณภาพที่เราคัดสรรมาแล้ว พร้อมราคาดีที่สุด"
          showViewAll={true}
          viewAllText="ดูรถแนะนำทั้งหมด"
          onViewAllClick={handleViewAllClick}
        />

        <div className="relative">
          {/* Desktop Carousel with Arrow Buttons */}
          <div className="hidden lg:block">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`absolute -left-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "text-gray-700 hover:bg-gray-50 hover:shadow-2xl hover:scale-105"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`absolute -right-6 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "text-gray-700 hover:bg-gray-50 hover:shadow-2xl hover:scale-105"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Cars Container */}
          <div className="px-0 lg:px-16">
            {" "}
            {/* Add padding for arrow space on desktop */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              className="flex gap-6 overflow-x-auto scrollbar-hide lg:pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {recommendedCars.map((car) => (
                <div key={car.id} className="flex-shrink-0 w-80 lg:w-72">
                  <CarCard
                    car={car}
                    layout="vertical"
                    showContactButton={true}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Show as Grid below lg breakpoint */}
          <div className="lg:hidden mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recommendedCars.slice(0, 4).map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  layout="vertical"
                  showContactButton={true}
                />
              ))}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={handleViewAllClick}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 font-semibold"
              >
                ดูรถแนะนำทั้งหมด
              </button>
            </div>
          </div>

          {/* Desktop: Scroll Indicator */}
          <div className="hidden lg:flex justify-center mt-6">
            <div className="flex gap-2">
              {Array.from({
                length: Math.ceil(recommendedCars.length / 3),
              }).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 bg-gray-300 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Promotion Banner */}
        <div className="mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 lg:p-8 text-white text-center">
          <h3 className="text-xl lg:text-2xl font-bold mb-2">
            🎉 โปรโมชันพิเศษสำหรับรถแนะนำ
          </h3>
          <p className="text-red-100 mb-4">
            ผ่อน 0% นาน 12 เดือน + ประกันฟรี 1 ปี สำหรับรถยนต์คัดสรร
          </p>
          <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
            สอบถามโปรโมชัน
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecommendedCarsSection;
