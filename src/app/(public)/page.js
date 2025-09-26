"use client";

import Header from "@/app/(public)/components/layout/Header";
import HeroSection from "@/app/(public)/components/sections/HeroSection";
import SearchForm from "@/app/(public)/components/sections/SearchForm";
import CarTypesSection from "@/app/(public)/components/sections/CarTypesSection";
import FeaturedCarsSection from "@/app/(public)/components/sections/FeaturedCarsSection";
import RecommendedCarsSection from "@/app/(public)/components/sections/RecommendedCarsSection";
import CarListingSection from "@/app/(public)/components/sections/CarListingSection";
import LatestCarsSection from "@/app/(public)/components/sections/LatestCarsSection";
import WhyChooseUsSection from "@/app/(public)/components/sections/WhyChooseUsSection";
import Footer from "@/app/(public)/components/layout/Footer";

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

      {/* Featured Cars Section */}
      <FeaturedCarsSection />

      {/* Recommended Cars Section with Carousel */}
      <RecommendedCarsSection />

      {/* Car Listing Section with Toggle View */}
      <CarListingSection />

      {/* Latest Cars Section */}
      <LatestCarsSection />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
