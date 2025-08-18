"use client";
import clsx from "clsx";
import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      size = "sm",
      fit = false,
      disabled = false,
      textAlign = "left",
      icon,
      error,
      isError,
      readOnly = false,
      ...props
    },
    ref
  ) => {
    const showError = error || isError;
    const sizeClasses = {
      sm: "h-8",
      md: "h-10",
      lg: "h-12",
      xl: "h-14",
    };

    return (
      <div className={clsx(fit && "flex-1")}>
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-main-400">{icon}</span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            readOnly={readOnly}
            {...props}
            className={clsx(
              `border bg-main-800 py-2 pr-4 text-sm text-main-400 placeholder:text-sm placeholder:text-main-600 ${
                sizeClasses[size]
              } ${
                showError ? "border-danger-500" : "border-main-500"
              } w-full rounded-lg focus:border-main-700 focus:outline-none focus:ring-1 focus:ring-main-300`,
              icon ? "pl-10" : "pl-4",
              disabled && "cursor-not-allowed bg-gray-200 opacity-50",
              textAlign === "center" && "text-center",
              textAlign === "right" && "text-right"
            )}
          />
        </div>
        {typeof showError === "string" && (
          <small className="text-xs text-danger-500">{showError}</small>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
