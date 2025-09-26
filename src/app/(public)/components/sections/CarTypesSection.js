"use client";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeader from "@/app/(public)/components/ui/SectionHeader";

const CarTypesSection = () => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const carTypes = [
    {
      id: 1,
      name: "รถเก๋ง",
      englishName: "Sedan",
      icon: "🚗",
      count: 150,
      description: "รถยนต์นั่งส่วนบุคคล",
      popular: true,
    },
    {
      id: 2,
      name: "รถ SUV",
      englishName: "SUV",
      icon: "🚙",
      count: 120,
      description: "รถอเนกประสงค์",
      popular: true,
    },
    {
      id: 3,
      name: "รถกระบะ",
      englishName: "Pickup",
      icon: "🛻",
      count: 80,
      description: "รถยนต์บรรทุกเล็ก",
      popular: false,
    },
    {
      id: 4,
      name: "รถแฮทช์แบ็ก",
      englishName: "Hatchback",
      icon: "🚗",
      count: 95,
      description: "รถเก๋งประตูท้าย",
      popular: true,
    },
    {
      id: 5,
      name: "รถคูเป้",
      englishName: "Coupe",
      icon: "🏎️",
      count: 35,
      description: "รถสปอร์ต 2 ประตู",
      popular: false,
    },
    {
      id: 6,
      name: "รถเปิดประทุน",
      englishName: "Convertible",
      icon: "🏎️",
      count: 15,
      description: "รถหลังคาเปิดได้",
      popular: false,
    },
    {
      id: 7,
      name: "รถตู้",
      englishName: "Van",
      icon: "🚐",
      count: 40,
      description: "รถโดยสารขนาดกลาง",
      popular: false,
    },
    {
      id: 8,
      name: "รถหรู",
      englishName: "Luxury",
      icon: "🏆",
      count: 25,
      description: "รถยนต์ระดับพรีเมียม",
      popular: false,
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
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleCardClick = (carType) => {
    console.log("Navigate to car type:", carType.name);
    // Handle navigation to car type listing
  };

  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="ประเภทรถยนต์"
          subtitle="เลือกดูรถยนต์ตามประเภทที่คุณสนใจ"
          showViewAll={true}
          viewAllText="ดูทุกประเภท"
          viewAllHref="/cars/types"
        />

        <div className="relative">
          {/* Desktop Scroll Buttons */}
          <div className="hidden lg:block">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`absolute -left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollLeft
                  ? "text-gray-700 hover:bg-gray-50 hover:shadow-xl"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`absolute -right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center transition-all duration-200 ${
                canScrollRight
                  ? "text-gray-700 hover:bg-gray-50 hover:shadow-xl"
                  : "text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Car Types Grid */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-4 overflow-x-auto scrollbar-hide lg:px-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {carTypes.map((carType) => (
              <div
                key={carType.id}
                onClick={() => handleCardClick(carType)}
                className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group border border-gray-100"
              >
                <div className="p-6">
                  <div className="relative">
                    {/* Popular Badge */}
                    {carType.popular && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        ยอดนิยม
                      </div>
                    )}

                    {/* Icon */}
                    <div className="text-4xl mb-4 flex justify-center">
                      {carType.icon}
                    </div>

                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors mb-1">
                        {carType.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {carType.englishName}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {carType.description}
                      </p>

                      {/* Count */}
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="text-2xl font-bold text-red-600">
                          {carType.count}
                        </div>
                        <div className="text-sm text-gray-600">
                          รถยนต์ในสต็อก
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="h-1 bg-gradient-to-r from-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-b-xl"></div>
              </div>
            ))}
          </div>

          {/* Mobile Scroll Indicator */}
          <div className="lg:hidden mt-4 flex justify-center">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>เลื่อนดูเพิ่มเติม</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-md">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-red-600">560+</div>
              <div className="text-sm text-gray-600">รถทั้งหมด</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">15+</div>
              <div className="text-sm text-gray-600">ยี่ห้อดัง</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">8</div>
              <div className="text-sm text-gray-600">ประเภทรถ</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-600">24/7</div>
              <div className="text-sm text-gray-600">บริการ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarTypesSection;
