"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/app/utils/cn";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      showPasswordToggle = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === "password" && showPassword ? "text" : type;
    const hasError = !!error;

    return (
      <div className="w-full">
        {/* Label (if provided directly) */}
        {label && (
          <label
            className={cn(
              "block text-sm font-medium transition-colors mb-1",
              hasError ? "text-danger-600" : "text-main-700",
              disabled && "text-main-400"
            )}
          >
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {Icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  hasError
                    ? "text-danger-400"
                    : isFocused
                    ? "text-secondary-500"
                    : "text-main-400"
                )}
              />
            </div>
          )}

          {/* Input Field */}
          <input
            type={inputType}
            className={cn(
              // Base styles
              "w-full bg-main-800 rounded-lg text-main-200 border transition-all duration-200",
              "placeholder:text-main-400 focus:outline-none focus:ring-2 focus:ring-offset-0",

              // Padding with/without icons
              Icon && iconPosition === "left" ? "pl-10 pr-4" : "px-4",
              type === "password" && showPasswordToggle ? "pr-12" : "",
              Icon && iconPosition === "right" ? "pr-10" : "",

              // Size
              "h-10 text-sm",

              // States
              hasError
                ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500"
                : "border-main-600 focus:border-secondary-500 focus:ring-secondary-500",

              disabled && "bg-main-100 text-main-400 cursor-not-allowed",

              className
            )}
            disabled={disabled}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Password Toggle */}
          {type === "password" && showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-main-400 hover:text-main-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Right Icon */}
          {Icon && iconPosition === "right" && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  hasError
                    ? "text-danger-400"
                    : isFocused
                    ? "text-secondary-500"
                    : "text-main-400"
                )}
              />
            </div>
          )}
        </div>

        {/* Helper Text / Error - Only show if not using InputRow */}
        {!label && (error || helperText) && (
          <p
            className={cn(
              "text-sm mt-1",
              hasError ? "text-danger-600" : "text-main-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
