"use client";

import { useState } from "react";

export function Switch({
  checked = false,
  onCheckedChange,
  disabled = false,
  className = "",
  size = "default",
  ...props
}) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (disabled) return;

    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  const sizeClasses = {
    sm: "h-4 w-7",
    default: "h-5 w-9",
    lg: "h-6 w-11",
  };

  const thumbSizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const translateClasses = {
    sm: isChecked ? "translate-x-3" : "translate-x-0.5",
    default: isChecked ? "translate-x-4" : "translate-x-0.5",
    lg: isChecked ? "translate-x-5" : "translate-x-0.5",
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      onClick={handleToggle}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
        ${
          isChecked
            ? "bg-primary-600 focus:ring-primary-500"
            : "bg-gray-200 focus:ring-gray-300"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
        }
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          ${thumbSizeClasses[size]}
          ${translateClasses[size]}
          inline-block bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out
        `}
      />
    </button>
  );
}

export default Switch;
