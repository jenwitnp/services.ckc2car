"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/public/images/placeholder-car.jpg",
      alt: "Car dealership slide 1",
    },
    {
      id: 2,
      image: "/public/images/placeholder-car.jpg",
      alt: "Car dealership slide 2",
    },
    {
      id: 3,
      image: "/public/images/placeholder-car.jpg",
      alt: "Car dealership slide 3",
    },
  ];

  // Auto slide change
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-[400px] lg:h-[500px] overflow-hidden">
      {/* Image Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center">
              {/* Placeholder for actual images */}
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🏢</div>
                <div className="text-lg">Slide {slide.id}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? "bg-white scale-125"
                : "bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
