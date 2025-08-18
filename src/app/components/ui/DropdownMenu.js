"use client";

import React, { useState, useRef, useEffect, useImperativeHandle } from "react";
import { MoreHorizontal } from "lucide-react";
import useOutsideClick from "@/app/hooks/useOutsideClick";

const DropdownItem = ({ icon, label, onClick }) => (
  <button
    className="flex w-full flex-row items-center justify-start gap-2 px-4 py-2 text-left text-sm text-main-400 hover:bg-main-600 hover:text-main-200"
    onClick={onClick}
    type="button"
  >
    {icon && <span className="mr-2 text-main-500">{icon}</span>}
    <span>{label}</span>
  </button>
);

const DropdownMenu = ({
  trigger,
  items = [],
  className = "",
  renderItem,
  position = "bottom-right",
  data = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [positionStyles, setPositionStyles] = useState({});
  const dropdownRef = useRef(null);
  const outsideRef = useOutsideClick(() => setIsOpen(false), false);

  useImperativeHandle(outsideRef, () => dropdownRef.current);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  useEffect(() => {
    if (isOpen) {
      const dropdown = dropdownRef.current;
      if (dropdown) {
        const rect = dropdown.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;

        let styles = {};
        if (position.includes("bottom") && rect.bottom > innerHeight) {
          styles = { ...styles, bottom: "100%", transform: "translateY(-4px)" };
        }
        if (position.includes("top") && rect.top < 0) {
          styles = { ...styles, top: "100%", transform: "translateY(4px)" };
        }
        if (position.includes("right") && rect.right > innerWidth) {
          styles = { ...styles, right: "0px" };
        }
        if (position.includes("left") && rect.left < 0) {
          styles = { ...styles, left: "0px" };
        }

        setPositionStyles(styles);
      }
    }
  }, [isOpen, position]);

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Trigger */}
      <button onClick={toggleDropdown} type="button">
        {trigger || <MoreHorizontal size={32} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 w-56 origin-top-right rounded-md bg-main-700  ${className}`}
          style={positionStyles}
        >
          <div
            className="max-h-48 overflow-visible py-1"
            style={{ maxWidth: "calc(100vw - 16px)" }}
          >
            {items.map((item, index) =>
              renderItem ? (
                renderItem(item, index, closeDropdown)
              ) : (
                <DropdownItem
                  key={index}
                  icon={item.icon}
                  label={item.label || item}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick?.(data);
                    closeDropdown();
                  }}
                />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { DropdownMenu, DropdownItem };
