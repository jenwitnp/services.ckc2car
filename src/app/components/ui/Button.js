"use client";

import { forwardRef } from "react";
import { cn } from "@/app/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  variant: {
    default: "bg-primary-500 hover:bg-primary-600 text-white shadow-md",
    destructive: "bg-danger-500 hover:bg-danger-600 text-white shadow-md",
    outline: "border border-main-300 bg-white hover:bg-main-50 text-main-900",
    secondary: "bg-main-200 hover:bg-main-300 text-main-900",
    ghost: "hover:bg-main-100 text-main-900",
    link: "text-primary-500 underline-offset-4 hover:underline",
    success: "bg-success-500 hover:bg-success-600 text-white shadow-md",
    warning: "bg-warning-500 hover:bg-warning-600 text-white shadow-md",
    line: "bg-social-line-500 hover:bg-social-line-600 text-white shadow-md",
    success: "bg-green-500 text-white hover:bg-green-600",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-8 text-lg",
    xl: "h-14 px-10 text-xl",
    icon: "h-10 w-10",
  },
  fullWidth: {
    true: "w-full",
    false: "",
  },
};

const Button = forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      fullWidth = false,
      loading = false,
      disabled = false,
      children,
      icon: Icon,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",

          // Variants
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          buttonVariants.fullWidth[fullWidth],

          // Loading state
          loading && "relative text-transparent",

          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {/* Icon left */}
        {Icon && iconPosition === "left" && !loading && (
          <Icon
            className={cn(
              "flex-shrink-0",
              children ? "mr-2" : "",
              size === "sm" ? "h-4 w-4" : "h-5 w-5"
            )}
          />
        )}

        {/* Content */}
        {children}

        {/* Icon right */}
        {Icon && iconPosition === "right" && !loading && (
          <Icon
            className={cn(
              "flex-shrink-0",
              children ? "ml-2" : "",
              size === "sm" ? "h-4 w-4" : "h-5 w-5"
            )}
          />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
