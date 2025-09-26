"use client";
import { ChevronRight } from "lucide-react";

const SectionHeader = ({
  title,
  subtitle = "",
  showViewAll = true,
  viewAllText = "ดูทั้งหมด",
  viewAllHref = "#",
  onViewAllClick,
  className = "",
  titleClassName = "",
  align = "left", // 'left', 'center', 'right'
}) => {
  const handleViewAllClick = (e) => {
    if (onViewAllClick) {
      e.preventDefault();
      onViewAllClick();
    }
  };

  const alignmentClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const justifyClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div className={`mb-6 lg:mb-8 ${className}`}>
      <div
        className={`flex items-center ${
          showViewAll ? "justify-between" : justifyClasses[align]
        } gap-4`}
      >
        <div className={alignmentClasses[align]}>
          <h2
            className={`text-2xl lg:text-3xl font-bold text-gray-800 ${titleClassName}`}
          >
            {title}
          </h2>
          {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
        </div>

        {showViewAll && (
          <div className="flex-shrink-0">
            <a
              href={viewAllHref}
              onClick={handleViewAllClick}
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-200 group"
            >
              <span>{viewAllText}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
