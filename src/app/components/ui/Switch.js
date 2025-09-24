"use client";

import { useState, useEffect } from "react";
import "./Switch.css";

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = "",
  size = "default",
  variant = "primary",
  width,
  height,
  ...props
}) {
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    if (disabled) return;

    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  // ✅ Better size calculations
  const sizeMap = {
    mini: { width: 28, height: 16 },
    sm: { width: 36, height: 20 },
    default: { width: 44, height: 24 },
    lg: { width: 56, height: 32 },
    xl: { width: 68, height: 40 },
  };

  const finalWidth = width || sizeMap[size]?.width || sizeMap.default.width;
  const finalHeight = height || sizeMap[size]?.height || sizeMap.default.height;

  // ✅ Ensure proper aspect ratio
  const calculatedWidth =
    width !== undefined
      ? width
      : height !== undefined
      ? Math.round(height * 1.83)
      : finalWidth;
  const calculatedHeight =
    height !== undefined
      ? height
      : width !== undefined
      ? Math.round(width / 1.83)
      : finalHeight;

  const customStyles = {
    "--switch-width": `${calculatedWidth}px`,
    "--switch-height": `${calculatedHeight}px`,
  };

  return (
    <label
      className={`modern-switch modern-switch--${variant} ${className}`}
      style={customStyles}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleToggle}
        disabled={disabled}
        className="modern-switch__input"
        {...props}
      />
      <span className="modern-switch__slider">
        <span className="modern-switch__thumb">
          <span className="modern-switch__thumb-inner"></span>
        </span>
        <span className="modern-switch__track"></span>
      </span>
    </label>
  );
}

export default Switch;
