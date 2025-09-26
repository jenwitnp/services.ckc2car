"use client";

import { useState } from "react";
import { Search, Menu } from "lucide-react";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
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
              onClick={() => setMobileMenuOpen(true)}
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

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
}
