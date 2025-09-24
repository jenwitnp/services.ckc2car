import ckc2carService from "@/app/services/ckc2car";
import { useQuery } from "@tanstack/react-query";

const fetchCarImages = async (carId) => {
  if (!carId) return [];

  try {
    const res = await ckc2carService.post("/api/car/images", {
      car_id: carId,
    });

    // ✅ Handle response and format image URLs
    let images = [];
    if (res.data?.status === "ok" && res.data?.data) {
      images = res.data.data;
    } else if (Array.isArray(res.data)) {
      images = res.data;
    }

    // ✅ Add full image URL to each image object
    const baseImageUrl =
      process.env.NEXT_PUBLIC_CKC_URL || "https://www.ckc2car.com";

    return images.map((image) => ({
      ...image,
      // ✅ Add full URL for the image
      imageUrl: `${baseImageUrl}/uploads/posts/thumbnail/${image.image}`,
      // ✅ Parse numeric fields
      orderNum: parseInt(image.orderNum) || 0,
      isFrontShow: image.front_show === "1",
      // ✅ Format dates
      createdAt: new Date(image.created),
      joinedAt: image.joined,
    }));
  } catch (error) {
    console.error("Error fetching car images:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch car images"
    );
  }
};

const useCarImages = (carId, options = {}) => {
  const {
    data: images = [],
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["carImages", carId],
    queryFn: () => fetchCarImages(carId),
    enabled: !!carId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    select: (data) => {
      // ✅ Sort images by orderNum
      return data.sort((a, b) => a.orderNum - b.orderNum);
    },
    ...options,
  });

  // ✅ Helper functions for common operations
  const getFrontImage = () => {
    return images.find((img) => img.isFrontShow) || images[0] || null;
  };

  const getImagesByOrder = () => {
    return images.sort((a, b) => a.orderNum - b.orderNum);
  };

  const getFrontShowImages = () => {
    return images.filter((img) => img.isFrontShow);
  };

  return {
    images,
    loading,
    error: error?.message || null,
    refetch,
    isFetching,
    // ✅ Helper methods
    getFrontImage,
    getImagesByOrder,
    getFrontShowImages,
    hasImages: images.length > 0,
    imageCount: images.length,
  };
};

export default useCarImages;
