import React from "react";

const FailMessage = ({
  message = "ไม่สามารถโหลดข้อมูลได้",
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center p-6 text-center text-red-600 ${className}`}
    role="alert"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 mb-3 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M9 9l6 6m0-6l-6 6"
      />
    </svg>
    <span className="text-lg font-medium">{message}</span>
  </div>
);

export default FailMessage;
