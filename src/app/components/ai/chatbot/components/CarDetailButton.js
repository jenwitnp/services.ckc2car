import React, { useCallback } from "react";
import { ExternalLink } from "lucide-react";
import { CONSTANTS, getButtonClasses } from "../utils/constants";
import { urlUtils } from "../utils/urlUtils";

const CarDetailButton = React.memo(
  ({ url, carId, variant = "primary", size = "sm", className = "" }) => {
    const handleClick = useCallback(() => {
      urlUtils.openCarDetail(url, `Car ${carId}`, carId);
    }, [url, carId]);

    return (
      <button
        onClick={handleClick}
        className={`${getButtonClasses(variant, size)} ${className}`}
      >
        <ExternalLink size={14} className="mr-2" />
        <span>ดูรายละเอียด SKU-{carId}</span>
      </button>
    );
  }
);

CarDetailButton.displayName = "CarDetailButton";
export default CarDetailButton;
