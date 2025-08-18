"use client";

/**
 * Reusable Loading Spinner Component
 */
export default function LoadingSpinner({
  size = "medium",
  text = "Loading...",
  color = "blue",
}) {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const colorClasses = {
    blue: "border-blue-500",
    gray: "border-gray-500",
    green: "border-green-500",
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          ${sizeClasses[size]} 
          border-2 border-t-transparent 
          ${colorClasses[color]} 
          rounded-full animate-spin mb-2
        `}
      ></div>
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
