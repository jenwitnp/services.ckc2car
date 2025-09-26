"use client";

import { X, ChevronRight } from "lucide-react";

export default function MobileMenu({ isOpen, onClose }) {
  const menuItems = [
    { label: "ค้นหารถมือสองทั้งหมด", href: "#", hasSubmenu: true },
    { label: "แลกเปลี่ยน-ขายรถ", href: "#" },
    { label: "ตัวแทนขาย", href: "#" },
    { label: "ข่าวสารและบทความ", href: "#" },
    { label: "เกี่ยวกับ CARS X", href: "#", hasSubmenu: true },
    { label: "ติดต่อเรา", href: "#" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-orange-500">
          <div className="text-white text-xl font-bold">
            CARS <span className="text-white">X</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-white hover:bg-orange-600 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto">
            <div className="py-2">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center justify-between px-4 py-4 text-gray-800 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={onClose}
                >
                  <span className="font-medium">{item.label}</span>
                  {item.hasSubmenu && (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </a>
              ))}
            </div>

            {/* Contact Section */}
            <div className="px-4 py-6 bg-gray-50 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">ติดต่อเรา</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div>📞 081-754-7177</div>
                <div>📍 811 ชั้น 2 ถ. ศรีนครินทร์</div>
                <div className="pl-4">แขวงสวนหลวง เขตสวนหลวง</div>
                <div className="pl-4">กรุงเทพมหานคร</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="px-4 py-4 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">ติดตามเรา</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">f</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">LINE</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">YT</span>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">IG</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
