"use client";
import SectionHeader from "@/app/(public)/components/ui/SectionHeader";
import CarCard from "@/app/(public)/components/ui/CarCard";

const LatestCarsSection = () => {
  // Sample latest cars data
  const latestCars = [
    {
      id: 1,
      name: "Mercedes-Benz C-Class",
      year: 2024,
      price: 2890000,
      downPayment: 289000,
      image: "/public/images/placeholder-car.jpg",
      mileage: "500 km",
      fuelType: "เบนซิน",
      transmission: "อัตโนมัติ",
      location: "กรุงเทพมหานคร",
      isPromoted: true,
      views: 450,
      tags: ["ใหม่ล่าสุด", "หรู"],
    },
    {
      id: 2,
      name: "Toyota Corolla Cross",
      year: 2024,
      price: 899000,
      downPayment: 89900,
      image: "/public/images/placeholder-car.jpg",
      mileage: "1,200 km",
      fuelType: "เบนซิน",
      transmission: "อัตโนมัติ",
      location: "นนทบุรี",
      isPromoted: false,
      views: 820,
      tags: ["SUV", "ประหยัด"],
    },
    {
      id: 3,
      name: "Ford Ranger Raptor",
      year: 2024,
      price: 1790000,
      downPayment: 179000,
      image: "/public/images/placeholder-car.jpg",
      mileage: "800 km",
      fuelType: "ดีเซล",
      transmission: "อัตโนมัติ",
      location: "ปทุมธานี",
      isPromoted: true,
      views: 650,
      tags: ["กระบะ", "ออฟโรด"],
    },
  ];

  const handleViewAllClick = () => {
    console.log("Navigate to latest cars page");
  };

  return (
    <section className="py-12 lg:py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <SectionHeader
          title="รถยนต์ล่าสุด"
          subtitle="รถยนต์ที่เพิ่งเข้ามาใหม่ในสต็อก พร้อมให้คุณเลือกชม"
          showViewAll={true}
          viewAllText="ดูรถใหม่ทั้งหมด"
          onViewAllClick={handleViewAllClick}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              layout="vertical"
              showContactButton={true}
            />
          ))}
        </div>

        {/* New Arrivals Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>มีรถใหม่เข้าทุกสัปดาห์</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestCarsSection;
