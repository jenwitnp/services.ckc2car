"use client";

export function Badge({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) {
  const baseClasses =
    "inline-flex items-center font-medium rounded-full border";

  const variantClasses = {
    default: "border-transparent bg-main-500 text-main-100 hover:bg-main-800",
    secondary: "border-transparent bg-main-100 text-main-900 hover:bg-main-200",
    destructive: "border-transparent bg-red-500 text-main-100 hover:bg-red-600",
    success: "border-transparent bg-green-500 text-main-100 hover:bg-green-600",
    warning:
      "border-transparent bg-yellow-500 text-main-100 hover:bg-yellow-600",
    outline: "border-gray-200 text-main-900 hover:bg-main-100",
    // Custom color classes for your use case
    "bg-main-500": "border-transparent bg-main-500 text-white",
    "bg-blue-500": "border-transparent bg-blue-500 text-white",
    "bg-green-500": "border-transparent bg-green-500 text-white",
    "bg-purple-500": "border-transparent bg-purple-500 text-white",
  };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    default: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  // If className includes bg- classes, use them directly
  const isCustomColor = className.includes("bg-");
  const finalVariantClass = isCustomColor ? className : variantClasses[variant];

  return (
    <div
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${isCustomColor ? "" : finalVariantClass}
        ${isCustomColor ? "" : className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Badge;
