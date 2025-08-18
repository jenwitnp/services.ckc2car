import { NextResponse } from "next/server";
import { fetchData } from "@/app/services/supabase/query";

// ✅ Enhanced car data formatter with SEO URL
const formatCarDetail = (car) => {
  if (!car) return null;

  // Parse images JSON
  let parsedImages = [];
  try {
    if (car.images && typeof car.images === "string") {
      parsedImages = JSON.parse(car.images);
    } else if (Array.isArray(car.images)) {
      parsedImages = car.images;
    }
  } catch (e) {
    console.warn("Failed to parse images for car:", car.id);
  }

  // Parse insurance data
  let parsedInsche = {};
  try {
    if (car.insche && typeof car.insche === "string") {
      parsedInsche = JSON.parse(car.insche);
    } else if (typeof car.insche === "object") {
      parsedInsche = car.insche || {};
    }
  } catch (e) {
    console.warn("Failed to parse insurance data for car:", car.id);
  }

  // Format images with full URLs
  const baseImageUrl = process.env.NEXT_PUBLIC_BASE_IMAGE_URL || "";
  const constructImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
    return `${baseImageUrl}${normalizedPath}`;
  };

  const formattedImages = parsedImages.map((img) => ({
    ...img,
    fullUrl: constructImageUrl(`/uploads/posts/thumbnail/${img.image}`),
    thumbnailUrl: constructImageUrl(`/uploads/posts/thumbnail/${img.image}`),
  }));

  // Calculate derived data
  const carAge = new Date().getFullYear() - (parseInt(car.years_car) || 0);
  const formattedPrice = parseInt(car.price || 0).toLocaleString("th-TH");
  const formattedMileage = parseInt(car.used_mile || 0).toLocaleString("th-TH");
  const fullTitle = `${car.brand_name} ${car.model_name} ${car.title}`.trim();

  // ✅ Generate SEO-friendly URL using server version
  const seoUrl = getCarDetailUrl(car, true); // absolute URL for SEO

  return {
    ...car,
    // ✅ Parsed and formatted data
    images: formattedImages,
    insche: parsedInsche,
    // ✅ Enhanced metadata
    _metadata: {
      formatted_price: formattedPrice,
      formatted_mileage: formattedMileage,
      car_age: carAge,
      full_title: fullTitle,
      main_image: constructImageUrl(car.image_path || car.thumbnail),
      image_count: formattedImages.length,
      has_youtube: !!car.youtube,
      promotion: car.marker || null,
      features: car.featured || null,
      view_count: parseInt(car.views || 0),
      is_available: car.car_status === "วางขาย",
      // ✅ SEO data
      seo: {
        url: seoUrl,
        title: `${fullTitle} - ราคา ฿${formattedPrice}`,
        description: `${fullTitle} ปี ${car.years_car} ราคา ${formattedPrice} บาท ไมล์ ${formattedMileage} กม. ${car.fuel_type} ${car.gear}`,
        keywords: [
          car.brand_name,
          car.model_name,
          car.years_car,
          "รถมือสอง",
          "ขายรถ",
        ].filter(Boolean),
        og_title: `${fullTitle} - CKC2Car`,
        og_description: `${fullTitle} ปี ${car.years_car} ราคา ${formattedPrice} บาท`,
        twitter_title: `${fullTitle} - ราคา ฿${formattedPrice}`,
        twitter_description: `${fullTitle} ปี ${car.years_car} ราคา ${formattedPrice} บาท`,
      },
      // ✅ Finance data
      finance: {
        ins_price: car.ins_price,
        vat_text: car.vat_text,
        down_payment: car.down_payment,
      },
      // ✅ Location data
      location: {
        branch_name: car.branch_name,
        branch_address: car.branch_address,
      },
    },
  };
};

export async function GET(request, { params }) {
  try {
    // ✅ Handle Next.js 15 params
    const resolvedParams = await params;
    const carId = resolvedParams.id;

    console.log(`[Car API] Getting car: ${carId}`);

    // ✅ Simple car fetch
    const { success, data: car } = await fetchData("cars_full_view", {
      filters: { id: parseInt(carId) },
      single: true,
    });

    if (!success || !car) {
      return NextResponse.json(
        {
          success: false,
          error: "Car not found",
        },
        { status: 404 }
      );
    }

    console.log(`[Car API] Found car: ${car.brand_name} ${car.model_name}`);

    // ✅ Return simple response
    return NextResponse.json({
      success: true,
      data: car,
    });
  } catch (error) {
    console.error("[Car API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
