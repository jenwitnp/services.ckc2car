"use client";
import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/app/services/supabase/query";

const CarParamsContext = createContext();

export const useCarParamsContext = () => useContext(CarParamsContext);

export const CarParamsProvider = ({ children }) => {
  // Query hooks for reference data
  const { data: carModel, isLoading: carModelLoading } = useQuery({
    queryKey: ["car_model"],
    queryFn: async () => {
      const res = await fetchData("car_model", { select: "title" });
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ["branch"],
    queryFn: async () => {
      const res = await fetchData("branch", { select: "title" });
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: carTypes, isLoading: carTypesLoading } = useQuery({
    queryKey: ["car_type"],
    queryFn: async () => {
      const res = await fetchData("car_type", { select: "title,id" });
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <CarParamsContext.Provider
      value={{
        carModel,
        carModelLoading,
        branch,
        branchLoading,
        carTypes,
        carTypesLoading,
      }}
    >
      {children}
    </CarParamsContext.Provider>
  );
};
