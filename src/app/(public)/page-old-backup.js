'use client';

import Header from '@/app/(public)/components/layout/Header';
import HeroSection from '@/app/(public)/components/sections/HeroSection';
import SearchForm from '@/app/(public)/components/sections/SearchForm';
import CarTypesSection from '@/app/(public)/components/sections/CarTypesSection';
import RecommendedCarsSection from '@/app/(public)/components/sections/RecommendedCarsSection';
import LatestCarsSection from '@/app/(public)/components/sections/LatestCarsSection';
import WhyChooseUsSection from '@/app/(public)/components/sections/WhyChooseUsSection';
import Footer from '@/app/(public)/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header with Mobile Menu */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Search Form */}
      <SearchForm />
      
      {/* Car Types Section */}
      <CarTypesSection />
      
      {/* Recommended Cars Section with Carousel */}
      <RecommendedCarsSection />
      
      {/* Latest Cars Section */}
      <LatestCarsSection />
      
      {/* Why Choose Us Section */}
      <WhyChooseUsSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
      model: "[9P0965]",
      price: 579000,
      monthly: 9693.43,
      image: "/cars/camry2.jpg",
      badge: "5",
    },
    {
      id: 3,
      brand: "2022 MITSUBISHI TRITON 2.4 GT PREMIUM",
      model: "[1P2390]",
      price: 699000,
      monthly: 11702.43,
      image: "/cars/majesty.jpg",
      badge: "5",
    },
    {
      id: 4,
      brand: "2022 MITSUBISHI TRITON 2.4 GT PREMIUM",
      model: "[1P2390]",
      price: 999000,
      monthly: 11702.43,
      image: "/cars/majesty.jpg",
      badge: "5",
    },
    // ✅ Add more cars for carousel demo
    {
      id: 5,
      brand: "2023 HONDA CIVIC 1.5 TURBO",
      model: "[9P0966]",
      price: 850000,
      monthly: 14250.43,
      image: "/cars/civic.jpg",
      badge: "5",
    },
    {
      id: 6,
      brand: "2021 MAZDA CX-5 2.0 SP",
      model: "[9P0967]",
      price: 750000,
      monthly: 12580.43,
      image: "/cars/cx5.jpg",
      badge: "5",
    },
  ];

  // ✅ Carousel navigation functions
  const nextRecommendedSlide = () => {
    const maxSlide = Math.ceil(recommendedCars.length / 3) - 1;
    setCurrentRecommendedSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevRecommendedSlide = () => {
    const maxSlide = Math.ceil(recommendedCars.length / 3) - 1;
    setCurrentRecommendedSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
  };

  const latestCars = [
    {
      id: 1,
      brand: "2020 MAZDA 2 1.3 S LEATHER",
      model: "AT",
      price: 369000,
      monthly: 6177.68,
      image: "/cars/fortuner.jpg",
      badge: "NEW",
    },
    {
      id: 2,
      brand: "2021 HONDA CR-V 2.4 S [1S...]",
      model: "AT",
      price: 739000,
      monthly: 12539.52,
      image: "/cars/hilux.jpg",
      badge: "NEW",
    },
  ];

  const testimonials = [
    {
      name: "นาย วิเชียร",
      review:
        "ประทับใจบริการและรถที่ซื้อมาก มีความโปร่งใสในการขาย และให้คำแนะนำดีมาก",
      rating: 5,
      avatar: "/avatars/customer1.jpg",
    },
    {
      name: "นางสาว สุกัญญา",
      review:
        "CARS X ให้บริการดีมาก ดูแลลูกค้าตั้งแต่เริ่มต้นจนจบ แนะนำเพื่อนแล้ว",
      rating: 5,
      avatar: "/avatars/customer2.jpg",
    },
    {
      name: "นาย ธนากร",
      review: "ซื้อรถครั้งที่ 2 แล้ว คุณภาพรถและบริการยอดเยี่ยม ราคาเป็นธรรม",
      rating: 5,
      avatar: "/avatars/customer3.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-orange-500 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 md:h-20 flex items-center">
          <div className="flex items-center">
            <div className="text-white text-xl md:text-2xl font-bold">
              CARS <span className="text-white">X</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Mobile Search Button */}
            <button className="w-9 md:hidden h-9 flex">
              <Search className="m-auto text-white" size={24} />
            </button>

            {/* Mobile Menu Button */}
            <button
              className="flex md:hidden w-9 h-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="m-auto text-white" size={24} />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-white hover:text-orange-200">
                ค้นหารถมือสองทั้งหมด
              </a>
              <a href="#" className="text-white hover:text-orange-200">
                แลกเปลี่ยน-ขายรถ
              </a>
              <a href="#" className="text-white hover:text-orange-200">
                ตัวแทนขาย
              </a>
              <a href="#" className="text-white hover:text-orange-200">
                ข่าวสารและบทความ
              </a>
              <a href="#" className="text-white hover:text-orange-200">
                CARS X
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Hero Section */}
      <section className="bg-gradient-to-br from-orange-400 to-orange-600 text-white relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-300/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-300/20 rounded-full translate-y-16 -translate-x-16"></div>

        <div className="relative z-10 py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Mobile Layout */}
            <div className="text-center md:hidden">
              <h1 className="text-2xl font-bold mb-2">799,000.- ฿</h1>
              <p className="text-lg mb-4">คุณภาพขับขี่ที่รอยืน</p>
              <div className="flex justify-center mb-4">
                <img
                  src="/cars/commuter-hero.png"
                  alt="Car"
                  className="w-48 h-auto max-w-full object-contain"
                />
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-right text-sm mb-2">28 พ.ค 2019</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="text-2xl">14,XXX.-</span>
                  <br />
                  COMMUTER
                </h1>
                <p className="text-lg mb-4">
                  โปรโมชันพิเศษสำหรับรถตู้
                  <br />
                  รับประกัน <span className="font-bold text-2xl">
                    5 ปี
                  </span>{" "}
                  นานกับใจประทก
                </p>
                <div className="text-right">
                  <div className="text-sm">เริ่มต้น</div>
                  <div className="text-3xl font-bold">799,000.-</div>
                </div>
              </div>
              <div className="flex justify-center">
                <img
                  src="/cars/commuter-hero.png"
                  alt="Toyota Commuter"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="bg-white relative -mt-8 md:mt-0 z-20">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg mx-2 md:mx-auto md:max-w-4xl -mt-8 md:mt-0">
            <div className="space-y-4 md:grid md:grid-cols-4 md:gap-4 md:space-y-0">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหารุ่น/ยี่ห้อรถ"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>ทุกช่วงราคา</option>
                <option>ต่ำกว่า 200,000</option>
                <option>200,000 - 400,000</option>
                <option>400,000 - 600,000</option>
              </select>

              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>ทุกยอดผ่อนต่อเดือน</option>
                <option>ต่ำกว่า 4,000</option>
                <option>4,000 - 6,000</option>
                <option>6,000 - 8,000</option>
              </select>

              <button className="w-full bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 transition-colors font-medium">
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Car Types Section */}
      <section className="py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-lg md:text-2xl">รถมือสองทั้งหมด</h2>
              <div className="text-sm text-gray-500">(460 คัน)</div>
              <div className="w-16 h-1 bg-orange-500 mt-1"></div>
            </div>
            <a href="#" className="text-sm font-bold underline">
              ดูทั้งหมด
            </a>
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide md:hidden">
            {carTypes.map((car, index) => (
              <div key={index} className="flex-shrink-0 w-24 text-center">
                <div className="w-24 h-16 flex items-center justify-center mb-1">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="font-medium text-xs leading-tight mb-1">
                  {car.name}
                </h3>
                <p className="text-xs text-gray-500">{car.count}</p>
              </div>
            ))}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid grid-cols-7 gap-4">
            {carTypes.map((car, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-center"
              >
                <img
                  src={car.image}
                  alt={car.name}
                  className="w-full h-16 object-contain mb-3"
                />
                <h3 className="font-medium text-sm text-gray-800">
                  {car.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{car.count}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Section */}
      <section className="py-6 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-lg md:text-2xl">แนะนำสำหรับคุณ</h2>
              <div className="w-16 h-1 bg-orange-500 mt-1"></div>
            </div>
            <a href="#" className="text-sm font-bold underline">
              ดูทั้งหมด
            </a>
          </div>

          {/* Mobile: Single column list */}
          <div className="flex flex-col space-y-4 md:hidden">
            {recommendedCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex">
                  <div className="w-32 h-40 relative bg-gray-200 flex-shrink-0">
                    <img
                      src={car.image}
                      alt={car.brand}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 w-16 h-6 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded">
                      {car.badge}
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-bold text-sm leading-tight mb-1">
                      {car.brand}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">{car.model}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 text-xs font-bold border border-blue-500 text-blue-500 rounded">
                        AT
                      </span>
                    </div>
                    <div className="text-lg font-bold text-orange-500 mb-1">
                      {car.price.toLocaleString()}.-
                    </div>
                    <div className="text-xs text-gray-500">
                      ผ่อนเริ่มต้น{" "}
                      <strong>{car.monthly.toLocaleString()}</strong> /เดือน*
                    </div>
                    <div className="mt-2 text-sm text-orange-500 font-bold underline">
                      ดูรายละเอียด
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Desktop: Carousel with arrows - FIXED SPACING */}
          <div className="hidden md:block relative px-16">
            {/* Navigation Arrows - Now positioned within padded container */}
            <button
              onClick={prevRecommendedSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentRecommendedSlide === 0}
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextRecommendedSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-orange-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                currentRecommendedSlide >=
                Math.ceil(recommendedCars.length / 3) - 1
              }
            >
              <ChevronRight size={24} />
            </button>

            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentRecommendedSlide * 100}%)`,
                }}
              >
                {/* Group cars into slides of 3 */}
                {Array.from(
                  { length: Math.ceil(recommendedCars.length / 3) },
                  (_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-3 gap-6">
                        {recommendedCars
                          .slice(slideIndex * 3, slideIndex * 3 + 3)
                          .map((car) => (
                            <div
                              key={car.id}
                              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className="relative">
                                <img
                                  src={car.image}
                                  alt={car.brand}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                                  {car.badge}
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-lg text-gray-800">
                                  {car.brand}
                                </h3>
                                <p className="text-gray-600 text-sm mb-3">
                                  {car.model}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-1 text-xs font-bold border border-blue-500 text-blue-500 rounded">
                                    AT
                                  </span>
                                </div>
                                <div className="text-2xl font-bold text-orange-500 mb-1">
                                  {car.price.toLocaleString()}.-
                                </div>
                                <div className="text-sm text-gray-500">
                                  ผ่อนเริ่มต้น {car.monthly.toLocaleString()}{" "}
                                  /เดือน*
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* ✅ Carousel Indicators */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from(
                { length: Math.ceil(recommendedCars.length / 3) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentRecommendedSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentRecommendedSlide === index
                        ? "bg-orange-500"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest Cars Section */}
      <section className="py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-lg md:text-2xl">
                รถมือสองเข้าใหม่มาแรง
              </h2>
              <div className="w-16 h-1 bg-orange-500 mt-1"></div>
            </div>
            <a href="#" className="text-sm font-bold underline">
              ดูทั้งหมด
            </a>
          </div>

          {/* Mobile: 2 column grid */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {latestCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={car.image}
                    alt={car.brand}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-bl">
                    {car.badge}
                  </div>
                  <div className="absolute top-0 left-0 w-16 h-6 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded-br">
                    5
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm leading-tight mb-1">
                    {car.brand}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="px-1 py-0.5 text-xs font-bold border border-blue-500 text-blue-500 rounded">
                      {car.model}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-orange-500 mb-1">
                    {car.price.toLocaleString()}.-
                  </div>
                  <div className="text-xs text-gray-500">
                    ผ่อนเริ่มต้น {car.monthly.toLocaleString()} /เดือน*
                  </div>
                  <div className="mt-2 text-xs text-orange-500 font-bold underline">
                    ดูรายละเอียด
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: 4 column grid */}
          <div className="hidden md:grid grid-cols-4 gap-6">
            {latestCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={car.image}
                    alt={car.brand}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                    {car.badge}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800">{car.brand}</h3>
                  <p className="text-gray-600 text-sm mb-2">{car.model}</p>
                  <div className="text-xl font-bold text-orange-500 mb-1">
                    {car.price.toLocaleString()}.-
                  </div>
                  <div className="text-sm text-gray-500">
                    ผ่อน {car.monthly.toLocaleString()} บาท/เดือน
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl leading-8 md:text-5xl md:leading-16 font-bold mb-4">
            ทำไมต้องเลือก
          </h2>
          <div className="md:grid grid-cols-2 gap-8 items-center">
            <div>
              <img
                src="/static/images/svg/logo.svg"
                alt="CARS X"
                className="w-25 h-12 md:w-45 md:h-22 object-contain"
              />
              <div className="w-16 h-1 bg-orange-500 mt-4 md:w-28 md:h-2"></div>
              <div className="mt-4 md:text-lg">
                ศูนย์จำหน่ายรถยนต์มือสองสัญชาติไทยแบบครบวงจร
                <br className="hidden md:block" />
                เราคัดสรรเฉพาะรถยนต์ที่ผ่านการ ตรวจสอบคุณภาพ
                <br className="hidden md:block" />
                จากทีมช่างผู้เชี่ยวชาญ ทำให้คุณมั่นใจได้ว่ารถทุกคันที่
                <br className="hidden md:block" />
                เราจำหน่ายมีสภาพดีและปลอดภัยทุกคันมาพร้อมประวัติ
                <br className="hidden md:block" />
                ข้อมูล ที่ชัดเจนและโปร่งใส เพื่อให้คุณมั่นใจว่าไม่มีปัญหา
                <br className="hidden md:block" />
                ซ่อนเร้น พร้อมกับ{" "}
                <strong>รับประกันสูงสุด 5 ปี 50,000 กม.*</strong>
                <br className="hidden md:block" />
                เพื่อทุกการขับขี่มีรอยยิ้ม
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="grid grid-cols-2 gap-1 rounded-lg md:rounded-2xl overflow-hidden">
                {[
                  {
                    title: "ตรวจสภาพรถ 210 จุด",
                    desc: "รถของเราผ่านการตรวจสภาพกว่า 210 จุด โดยทีมงานช่างมืออาชีพ",
                  },
                  {
                    title: "ปรับสภาพรถ โดยมืออาชีพ",
                    desc: "ปรับสภาพ เก็บงาน ทำความสะอาด ให้รถทุกคันพร้อมใช้งานเหมือนใหม่",
                  },
                  {
                    title: "มั่นใจ 100%",
                    desc: "รับประกันรถไม่มีชนหนัก พลิกคว่ำ น้ำท่วม หรือกรอไมล์",
                  },
                  {
                    title: "อุ่นใจ เราดูแลคุณและรถ",
                    desc: "บริการหลังการขายด้วยบริการ ช่วยเหลือฉุกเฉิน 24 โมง",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="pl-4 py-3 md:p-6 h-39 md:h-57 flex flex-col justify-center text-white bg-orange-500 relative"
                  >
                    <h3 className="text-xs md:text-xl font-bold relative leading-tight">
                      {item.title}
                    </h3>
                    <div className="mt-2 md:mt-0 relative">
                      <div className="text-xs md:text-base relative leading-tight">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-lg md:text-2xl mb-4">
            สิ่งที่ลูกค้าพูดถึงเรา
          </h2>
          <div className="w-16 h-1 bg-orange-500 mb-6"></div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-orange-100 md:bg-white rounded-xl p-4 md:p-6 flex-1"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {testimonial.name}
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  "{testimonial.review}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-lg md:text-2xl">รวมภาพประทับใจ</h2>
              <div className="w-16 h-1 bg-orange-500 mt-1"></div>
            </div>
            <a href="#" className="text-sm font-bold underline">
              ดูทั้งหมด
            </a>
          </div>

          <div className="relative">
            <img
              className="w-full rounded-lg object-contain"
              src="/static/images/img-gallery-mobile-1x.jpg"
              alt="Gallery"
            />
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h2 className="font-bold text-lg md:text-2xl">ข่าวสารจาก</h2>
              <img
                src="/static/images/svg/logo.svg"
                alt="CARS X"
                className="w-15 h-7 md:w-34 md:h-16 object-contain"
              />
            </div>
            <a href="#" className="text-sm font-bold underline">
              ดูทั้งหมด
            </a>
          </div>
          <div className="w-16 h-1 bg-orange-500 mb-6"></div>

          {/* Featured News */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6 md:grid md:grid-cols-2 md:gap-6 md:items-center">
            <div className="aspect-video bg-gray-200">
              <img
                src="/news/news1.jpg"
                alt="News"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 md:p-0">
              <h3 className="font-bold text-lg md:text-xl mb-2">
                เทคนิคออกรถตู้มือสอง ให้จัดไฟแนนซ์ผ่านอย่างง่ายๆ
              </h3>
              <p className="text-gray-600 text-sm md:text-base mb-4">
                การซื้อ รถตู้ ถือเป็นการลงทุนที่คุ้มค่า
                ทั้งเพื่อการใช้งานด้านธุรกิจ การเดินทางของครอบครัว หรือแม้ก
              </p>
              <div className="text-sm font-bold underline text-orange-500">
                อ่านต่อ...
              </div>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg overflow-hidden shadow-sm"
              >
                <div className="grid grid-cols-2 md:block gap-4">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={`/news/news${item}.jpg`}
                      alt={`News ${item}`}
                      className="w-full h-full object-cover rounded-lg md:rounded-none"
                    />
                  </div>
                  <div className="md:p-4">
                    <h3 className="font-bold text-sm md:text-base leading-tight mb-2">
                      ข้อดีของเว็บไซต์ CARS X ศูนย์รวมรถยนต์มือสองที่ครบวงจร
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-2 hidden md:block">
                      หากคุณกำลังมองหา รถยนต์มือสองคุณภาพดี สักคัน
                      แต่ไม่อยากเสียเวลา...
                    </p>
                    <div className="text-xs md:text-sm font-bold underline text-orange-500">
                      อ่านต่อ...
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 mb-6">
            <img
              src="/static/images/svg/logo.svg"
              alt="CARS X"
              className="w-17 h-8 md:w-34 md:h-16 object-contain"
            />
            <div className="hidden md:block text-lg md:text-xl font-bold">
              คาร์เอ็กซ์ ทุกการขับขี่มีรอยยิ้ม
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="md:hidden">
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="#" className="hover:underline font-bold">
                    ค้นหารถมือสองทั้งหมด
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline font-bold">
                    เกี่ยวกับ CARS X
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline font-bold">
                    ข่าวสาร/บทความ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline font-bold">
                    ติดต่อเรา
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden md:block">
              <ul className="flex flex-col gap-4">
                <li>
                  <a href="#" className="hover:underline font-bold">
                    ค้นหารถมือสองทั้งหมด
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline font-bold">
                    แลกเปลี่ยน-ขายรถ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline font-bold">
                    เกี่ยวกับ CARS X
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Vision & Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    ประวัติ CARS X
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    การรับประกัน
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    ตัวแทนขาย
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden md:block">
              <ul className="flex flex-col gap-4">
                <li>
                  <a href="#" className="hover:underline font-bold">
                    ข่าวสาร/บทความ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline font-bold">
                    นโยบายความเป็นส่วนตัว
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden md:block">
              <div>
                <a href="#" className="font-bold hover:underline">
                  ติดต่อเรา
                </a>
              </div>
              <div>
                <a href="tel:081-754-7177" className="hover:underline">
                  081-754-7177
                </a>
              </div>
              <div className="mt-2">
                <strong>CARS X</strong> 811 ชั้น 2 ถ. ศรีนครินทร์ แขวงสวนหลวง
                เขตสวนหลวง กรุงเทพมหานคร
              </div>
            </div>

            <div>
              <div className="font-bold mb-4">ช่องทางติดต่อออนไลน์</div>
              <ul className="flex flex-col gap-4">
                <li className="flex items-center gap-2">
                  <img
                    src="/static/images/icon-facebook.png"
                    alt="Facebook"
                    className="w-6 h-6"
                  />
                  <span>CARS X Fanpage</span>
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src="/static/images/icon-line.png"
                    alt="Line"
                    className="w-6 h-6"
                  />
                  <span>LINE Official</span>
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src="/static/images/icon-youtube.png"
                    alt="YouTube"
                    className="w-6 h-6"
                  />
                  <span>YouTube Channel</span>
                </li>
                <li className="flex items-center gap-2">
                  <img
                    src="/static/images/icon-instagram.png"
                    alt="Instagram"
                    className="w-6 h-6"
                  />
                  <span>Instagram Channel</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="py-2 text-white bg-orange-500 text-center text-sm font-medium -mx-4 md:mx-0 md:rounded">
            ©2025 <span className="uppercase">carsx.info</span>. ALL RIGHTS
            RESERVED.
          </div>
        </div>
      </footer>

      {/* Add CSS for scrollbar-hide */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
