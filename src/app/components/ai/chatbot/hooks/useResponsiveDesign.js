import { useState, useEffect } from "react";
import { CONSTANTS } from "../utils/constants";

export const useResponsiveDesign = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return {
    windowSize,
    isDesktop: windowSize.width >= CONSTANTS.BREAKPOINTS.MOBILE,
    isMobile: windowSize.width < CONSTANTS.BREAKPOINTS.MOBILE,
  };
};
