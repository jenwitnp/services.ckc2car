"use client";
import {
  Facebook,
  Instagram,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    "ซื้อ-ขายรถยนต์",
    "จัดไฟแนนซ์",
    "ประเมินราคารถ",
    "ต่อทะเบียนรถ",
    "ประกันภัยรถยนต์",
    "บริการหลังการขาย",
  ];

  const carBrands = [
    "Toyota",
    "Honda",
    "Nissan",
    "Mazda",
    "Mitsubishi",
    "BMW",
    "Mercedes-Benz",
    "Audi",
  ];

  const quickLinks = [
    { name: "เกี่ยวกับเรา", href: "/about" },
    { name: "ติดต่อเรา", href: "/contact" },
    { name: "นโยบายความเป็นส่วนตัว", href: "/privacy" },
    { name: "เงื่อนไขการใช้งาน", href: "/terms" },
    { name: "คำถามที่พบบ่อย", href: "/faq" },
    { name: "ข่าวสาร", href: "/news" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-red-400 mb-4">CARS X</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                ผู้นำด้านการขายรถยนต์มือสองคุณภาพ
                พร้อมบริการครบครันและราคาที่เป็นธรรม ด้วยประสบการณ์กว่า 10 ปี
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-gray-300">02-xxx-xxxx</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-gray-300">info@carsx.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-gray-300">จันทร์-อาทิตย์ 8:00-20:00</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-bold mb-6">บริการของเรา</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Car Brands */}
          <div>
            <h4 className="text-lg font-bold mb-6">ยี่ห้อรถยนต์</h4>
            <ul className="space-y-3">
              {carBrands.map((brand, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200"
                  >
                    {brand}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links & Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-6">ลิงก์ด่วน</h4>
            <ul className="space-y-3 mb-8">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-red-400 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <div>
              <h5 className="text-base font-semibold mb-3">รับข้อมูลข่าวสาร</h5>
              <p className="text-gray-300 text-sm mb-3">
                สมัครรับข่าวสารและโปรโมชันพิเศษ
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="อีเมลของคุณ"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-400"
                />
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex-shrink-0">
                  สมัคร
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media & Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Social Media */}
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">ติดตามเราได้ที่:</span>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors duration-200"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-gray-300 text-sm text-center md:text-right">
              <p>© {currentYear} CARS X. สงวนลิขสิทธิ์.</p>
              <p className="mt-1">พัฒนาด้วย ❤️ โดยทีมงาน CARS X</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center group hover:scale-110"
        aria-label="กลับขึ้นด้านบน"
      >
        <svg
          className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
