import React from "react";
import { urlUtils } from "../utils/urlUtils";

const CarDetailButton = React.memo(
  ({ url, carId, title, variant = "primary", size = "sm", className = "" }) => {
    const handleClick = () => {
      console.log("CarDetailButton clicked:", { url, carId, title });

      if (url) {
        urlUtils.openCarDetail(url, title, carId);
      } else {
        console.warn("No URL provided for car:", carId);
      }
    };

    const variantClasses = {
      primary: "bg-success-500 hover:bg-success-600 text-white",
      secondary: "bg-main-500 hover:bg-main-600 text-white",
      outline: "border border-blue-500 text-blue-500 hover:bg-success-100",
    };

    const sizeClasses = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2 text-sm",
    };

    return (
      <button
        onClick={handleClick}
        className={`
        ${variantClasses[variant]} 
        ${sizeClasses[size]}
        ${className}
        rounded-md font-medium transition-colors
        inline-flex items-center justify-center
        hover:shadow-sm
      `}
        title={title || `ดูรายละเอียดรถ ${carId}`}
      >
        🚗 รายละเอียด
      </button>
    );
  }
);

CarDetailButton.displayName = "CarDetailButton";

export default CarDetailButton;
