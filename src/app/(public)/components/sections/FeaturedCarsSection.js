"use client";
import SectionHeader from "@/app/(public)/components/ui/SectionHeader";
import CarListCard from "@/app/(public)/components/ui/CarListCard";

const FeaturedCarsSection = () => {
  // Car data matching your image
  const featuredCars = [
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
      badgeColor: "orange",
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
      badgeColor: "orange",
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
      badgeColor: "orange",
    },
  ];

  const handleViewAllClick = () => {
    console.log("Navigate to featured cars page");
  };

  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="รถยนต์แนะนำ"
          subtitle="รถยนต์คุณภาพดี ราคาดี ที่เราคัดสรรมาเป็นพิเศษสำหรับคุณ"
          showViewAll={true}
          viewAllText="ดูรถทั้งหมด"
          onViewAllClick={handleViewAllClick}
        />

        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:block space-y-4">
          {featuredCars.map((car) => (
            <CarListCard key={car.id} car={car} layout="horizontal" />
          ))}
        </div>

        {/* Mobile: Vertical Grid Layout */}
        <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredCars.map((car) => (
            <CarListCard key={car.id} car={car} layout="vertical" />
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                💡 ข้อมูลสำคัญ
              </h4>
              <p className="text-gray-600 text-sm">
                * อัตราดอกเบี้ยและค่างวดรายเดือนขึ้นอยู่กับผลการพิจารณาสินเชื่อ
              </p>
            </div>
            <div className="flex-shrink-0">
              <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200">
                สอบถามเพิ่มเติม
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarsSection;
