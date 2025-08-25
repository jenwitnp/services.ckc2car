"use client";

import { cn } from "@/app/utils/cn";

const alertVariants = {
  variant: {
    default: "bg-main-50 border-main-200 text-main-800",
    destructive: "bg-danger-50 border-danger-200 text-danger-800",
    success: "bg-success-50 border-success-200 text-success-800",
    warning: "bg-warning-50 border-warning-200 text-warning-800",
    info: "bg-info-50 border-info-200 text-info-800",
  },
};

const Alert = ({
  className,
  variant = "default",
  children,
  icon: Icon,
  title,
  onClose,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border p-4",
        alertVariants.variant[variant],
        className
      )}
      {...props}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-main-400 hover:text-main-600 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <div className="flex items-start">
        {/* Icon */}
        {Icon && (
          <div className="flex-shrink-0 mr-3">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div className="flex-1">
          {/* Title */}
          {title && <h4 className="font-medium mb-1">{title}</h4>}

          {/* Content */}
          <div className={cn(title ? "text-sm" : "")}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
