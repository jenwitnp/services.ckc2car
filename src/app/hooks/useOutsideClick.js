"use client";
import { useEffect, useRef } from "react";

export default function useOutsideClick(callback, useCapture = false) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    }

    document.addEventListener("click", handleClick, useCapture);

    return () => {
      document.removeEventListener("click", handleClick, useCapture);
    };
  }, [callback, useCapture]);

  return ref;
}
