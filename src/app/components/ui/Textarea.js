"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import { cn } from "@/app/utils/cn";

const Textarea = forwardRef(
  (
    {
      className,
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      icon: Icon,
      iconPosition = "left",
      rows = 4,
      autoResize = false,
      maxRows = 10,
      minRows = 2,
      showCharacterCount = false,
      maxLength,
      placeholder = "Enter your text...",
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [characterCount, setCharacterCount] = useState(0);
    const textareaRef = useRef(null);
    const hasError = !!error;

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;

        const adjustHeight = () => {
          textarea.style.height = "auto";
          const scrollHeight = textarea.scrollHeight;
          const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
          const paddingHeight =
            parseInt(getComputedStyle(textarea).paddingTop) +
            parseInt(getComputedStyle(textarea).paddingBottom);

          const minHeight = minRows * lineHeight + paddingHeight;
          const maxHeight = maxRows * lineHeight + paddingHeight;

          const newHeight = Math.min(
            Math.max(scrollHeight, minHeight),
            maxHeight
          );
          textarea.style.height = `${newHeight}px`;
        };

        adjustHeight();
        textarea.addEventListener("input", adjustHeight);

        return () => {
          textarea.removeEventListener("input", adjustHeight);
        };
      }
    }, [autoResize, minRows, maxRows]);

    // Handle character count
    const handleChange = (e) => {
      const value = e.target.value;
      setCharacterCount(value.length);

      if (props.onChange) {
        props.onChange(e);
      }
    };

    // Combine refs
    const combinedRef = (node) => {
      textareaRef.current = node;
      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            className={cn(
              "block text-sm font-medium transition-colors mb-1",
              hasError ? "text-danger-600" : "text-main-200",
              disabled && "text-main-400"
            )}
          >
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          {/* Icon */}
          {Icon && (
            <div
              className={cn(
                "absolute top-3 z-10",
                iconPosition === "left" ? "left-3" : "right-3"
              )}
            >
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

          {/* Textarea Field */}
          <textarea
            className={cn(
              // Base styles
              "w-full bg-main-800 rounded-lg text-main-200 border transition-all duration-200",
              "placeholder:text-main-400 focus:outline-none focus:ring-2 focus:ring-offset-0",
              "resize-none", // Disable default resize handle

              // Padding with/without icons
              Icon && iconPosition === "left" ? "pl-10 pr-4" : "px-4",
              Icon && iconPosition === "right" ? "pr-10" : "",

              // Vertical padding
              "py-3 text-sm leading-relaxed",

              // States
              hasError
                ? "border-danger-300 focus:border-danger-500 focus:ring-danger-500"
                : "border-main-600 focus:border-secondary-500 focus:ring-secondary-500",

              disabled && "bg-main-100 text-main-400 cursor-not-allowed",

              // Auto resize
              autoResize && "overflow-hidden",

              className
            )}
            rows={autoResize ? minRows : rows}
            disabled={disabled}
            ref={combinedRef}
            placeholder={placeholder}
            maxLength={maxLength}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={handleChange}
            {...props}
          />

          {/* Character Count */}
          {showCharacterCount && (
            <div className="absolute bottom-2 right-3 text-xs text-main-400">
              <span
                className={cn(
                  maxLength && characterCount > maxLength * 0.8
                    ? characterCount >= maxLength
                      ? "text-danger-500"
                      : "text-warning-500"
                    : "text-main-400"
                )}
              >
                {characterCount}
                {maxLength && (
                  <span className="text-main-500">/{maxLength}</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Helper Text / Error */}
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

        {/* Character count below (alternative placement) */}
        {showCharacterCount && (error || helperText) && (
          <div className="flex justify-between items-center mt-1">
            <p
              className={cn(
                "text-sm",
                hasError ? "text-danger-600" : "text-main-500"
              )}
            >
              {error || helperText}
            </p>
            <span
              className={cn(
                "text-xs",
                maxLength && characterCount > maxLength * 0.8
                  ? characterCount >= maxLength
                    ? "text-danger-500"
                    : "text-warning-500"
                  : "text-main-400"
              )}
            >
              {characterCount}
              {maxLength && <span className="text-main-500">/{maxLength}</span>}
            </span>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
