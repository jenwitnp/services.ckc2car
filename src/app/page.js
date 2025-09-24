"use client";

import { useState } from "react";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carTypes = [
    { name: "HONDA CITY", image: "/cars/honda-city.png", count: "120 คัน" },
    { name: "MAZDA 2", image: "/cars/mazda2.png", count: "85 คัน" },
    { name: "TOYOTA VIOS", image: "/cars/vios.png", count: "95 คัน" },
    { name: "NISSAN ALMERA", image: "/cars/almera.png", count: "67 คัน" },
    { name: "HONDA CIVIC", image: "/cars/civic.png", count: "45 คัน" },
    { name: "TOYOTA ALTIS", image: "/cars/altis.png", count: "78 คัน" },
    { name: "BMW SERIES", image: "/cars/bmw.png", count: "23 คัน" },
  ];

  const recommendedCars = [
    {
      id: 1,
      brand: "TOYOTA CAMRY 2.0",
      model: "G EXTREMO ปี 2019",
      price: "699,000",
      originalPrice: "750,000",
      discount: "51,000",
      image: "/cars/camry1.jpg",
      badge: "HOT",
    },
    {
      id: 2,
      brand: "TOYOTA CAMRY 2.5",
      model: "HYBRID PREMIUM ปี 2019",
      price: "789,000",
      originalPrice: "850,000",
      discount: "61,000",
      image: "/cars/camry2.jpg",
      badge: "NEW",
    },
    {
      id: 3,
      brand: "TOYOTA MAJESTY",
      model: "2.8 TOURING ปี 2019",
      price: "2,165,000",
      originalPrice: "2,250,000",
      discount: "85,000",
      image: "/cars/majesty.jpg",
      badge: "SALE",
    },
  ];

  const latestCars = [
    {
      id: 1,
      brand: "TOYOTA FORTUNER",
      model: "2019",
      price: "799,000",
      monthly: "15,890",
      image: "/cars/fortuner.jpg",
      badge: "NEW",
    },
    {
      id: 2,
      brand: "TOYOTA HILUX REVO",
      model: "2021",
      price: "699,000",
      monthly: "13,980",
      image: "/cars/hilux.jpg",
      badge: "HOT",
    },
    {
      id: 3,
      brand: "MAZDA 2 1.3 S LAN",
      model: "2020",
      price: "369,000",
      monthly: "7,380",
      image: "/cars/mazda2-red.jpg",
      badge: "SALE",
    },
    {
      id: 4,
      brand: "MAZDA CX-5",
      model: "2019",
      price: "659,000",
      monthly: "13,180",
      image: "/cars/cx5.jpg",
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-orange-500">
                CARS <span className="text-orange-600">X</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-orange-500">
                หน้าแรก
              </a>
              <a href="#" className="text-gray-700 hover:text-orange-500">
                ค้นหารถยนต์
              </a>
              <a href="#" className="text-gray-700 hover:text-orange-500">
                สินเชื่อ
              </a>
              <a href="#" className="text-gray-700 hover:text-orange-500">
                ประกันภัย
              </a>
              <a href="#" className="text-gray-700 hover:text-orange-500">
                ติดต่อเรา
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-orange-500">
                <Phone className="w-5 h-5" />
              </button>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                ลงทะเบียน
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
                รับประกัน <span className="font-bold text-2xl">5 ปี</span>{" "}
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
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex-1 max-w-xs">
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>ยี่ห้อรถยนต์</option>
                <option>Toyota</option>
                <option>Honda</option>
                <option>Mazda</option>
              </select>
            </div>
            <div className="flex-1 max-w-xs">
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>รุ่นรถยนต์</option>
              </select>
            </div>
            <div className="flex-1 max-w-xs">
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>ช่วงราคาที่ต้องการ</option>
              </select>
            </div>
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors">
              ค้นหา
            </button>
          </div>
        </div>
      </section>

      {/* Car Types Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">รถยี่ห้อยอดฮิต</h2>
            <a
              href="#"
              className="text-orange-500 hover:text-orange-600 flex items-center"
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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

      {/* Recommended Cars Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">แนะนำสำหรับคุณ</h2>
            <a
              href="#"
              className="text-orange-500 hover:text-orange-600 flex items-center"
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCars.map((car) => (
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
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${
                      car.badge === "HOT"
                        ? "bg-red-500"
                        : car.badge === "NEW"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  >
                    {car.badge}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800">
                    {car.brand}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{car.model}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-orange-500">
                        {car.price.toLocaleString()}.-
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        {car.originalPrice.toLocaleString()}.-
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">ประหยัด</div>
                      <div className="text-sm font-bold text-red-500">
                        {car.discount.toLocaleString()}.-
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Cars Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              รถยี่ห้อยอดฮิตใหม่มาแรง
            </h2>
            <a
              href="#"
              className="text-orange-500 hover:text-orange-600 flex items-center"
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${
                      car.badge === "HOT"
                        ? "bg-red-500"
                        : car.badge === "NEW"
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                  >
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
      <section className="py-12 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            ทำไมต้องเลือก <span className="text-orange-500">CARS X</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-sm">ปีรับประกัน</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">20+</div>
                  <div className="text-sm">สาขาทั่วประเทศ</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm">รถสภาพดี</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm">บริการหลังการขาย</div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ความมั่นใจที่มากกว่า
              </h3>
              <p className="text-gray-600 leading-relaxed">
                CARS X ให้บริการรถยนต์มือสองคุณภาพดี พร้อมการรับประกัน 5 ปี
                และบริการหลังการขาย 24 ชั่วโมง เพื่อความมั่นใจในทุกการเดินทาง
                ด้วยทีมงานมืออาชีพและเทคโนโลยีที่ทันสมัย
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            สิ่งที่ลูกค้าพูดถึงเรา
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-orange-100 rounded-xl p-6">
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
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">รวมภาพประจันใจ</h2>
            <a
              href="#"
              className="text-orange-500 hover:text-orange-600 flex items-center"
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div
                key={item}
                className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <img
                  src={`/gallery/image${item}.jpg`}
                  alt={`Gallery ${item}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              ข่าวสารจาก <span className="text-orange-500">CARS X</span>
            </h2>
            <a
              href="#"
              className="text-orange-500 hover:text-orange-600 flex items-center"
            >
              ดูทั้งหมด <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <img
                src="/news/news1.jpg"
                alt="News 1"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  เทคนิคการดูแลรถยนต์ในช่วงฝนตก
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  แนวทางการดูแลรถยนต์ให้พร้อมใช้งานในช่วงฤดูฝน
                  พร้อมเคล็ดลับจากผู้เชี่ยวชาญ...
                </p>
                <div className="text-sm text-gray-500">อ่านต่อ...</div>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <img
                src="/news/news2.jpg"
                alt="News 2"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  CARS X เปิดสาขาใหม่ เซ็นทรัลพลาซา
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  ขยายการบริการด้วยสาขาใหม่ในห้างสรรพสินค้าชั้นนำ
                  พร้อมโปรโมชันพิเศษ...
                </p>
                <div className="text-sm text-gray-500">อ่านต่อ...</div>
              </div>
            </div>
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <img
                src="/news/news3.jpg"
                alt="News 3"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  CARS X จับมือ ธนาคารชั้นนำ สินเชื่อดอกเบี้ยพิเศษ
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  ความร่วมมือใหม่ที่จะทำให้ลูกค้าเข้าถึงรถยนต์ในฝันได้ง่ายขึ้น...
                </p>
                <div className="text-sm text-gray-500">อ่านต่อ...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-orange-500 mb-4">
                CARS <span className="text-orange-600">X</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                ผู้นำด้านรถยนต์มือสองคุณภาพดี พร้อมบริการครบวงจร
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">บริการของเรา</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-orange-500">
                    ซื้อ-ขายรถยนต์
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    สินเชื่อรถยนต์
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    ประกันภัยรถยนต์
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    บริการหลังการขาย
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">เกี่ยวกับเรา</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="#" className="hover:text-orange-500">
                    เกี่ยวกับบริษัท
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    ข่าวสาร
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    ร่วมงานกับเรา
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500">
                    นโยบายความเป็นส่วนตัว
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">ติดต่อเรา</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>02-123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>info@carsx.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>กรุงเทพมหานคร</span>
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <Facebook className="w-5 h-5 text-blue-400 hover:text-blue-300 cursor-pointer" />
                <Instagram className="w-5 h-5 text-pink-400 hover:text-pink-300 cursor-pointer" />
                <Youtube className="w-5 h-5 text-red-400 hover:text-red-300 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CARS X. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
