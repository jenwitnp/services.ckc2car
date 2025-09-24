import ckc2carService from "@/app/services/ckc2car";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Function to fetch offers data and return only 'data' if exists
export const fetchOffers = async () => {
  const response = await ckc2carService.get("/api/car/offer");
  return response?.data?.data ?? [];
};
// ✅ Hook to fetch all offers
export const useOffers = (options = {}) => {
  return useQuery({
    queryKey: ["car_offers"],
    queryFn: fetchOffers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
