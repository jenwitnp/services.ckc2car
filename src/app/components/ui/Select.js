"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export function Select({
  value,
  onValueChange,
  placeholder = "เลือก...",
  disabled = false,
  children,
  className = "",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef(null);

  // Get options from children
  const options = children?.filter((child) => child.type === "option") || [];
  const selectedOption = options.find(
    (option) => option.props.value === selectedValue
  );

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`} {...props}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-main-800 border border-main-600 rounded-md h-10 shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm
          ${
            disabled
              ? "bg-gray-50 text-gray-500 cursor-not-allowed"
              : "cursor-pointer"
          }
          ${isOpen ? "ring-1 ring-primary-500 border-primary-500" : ""}
        `}
      >
        <span className="block truncate">
          {selectedOption?.props.children || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {options.map((option) => {
            const isSelected = option.props.value === selectedValue;
            return (
              <div
                key={option.props.value}
                onClick={() => handleSelect(option.props.value)}
                className={`
                  cursor-pointer select-none relative py-2 pl-10 pr-4
                  ${
                    isSelected
                      ? "text-primary-900 bg-primary-100"
                      : "text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <span
                  className={`block truncate ${
                    isSelected ? "font-medium" : "font-normal"
                  }`}
                >
                  {option.props.children}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Select;
