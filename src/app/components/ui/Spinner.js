import React from "react";

const sizeClasses = {
  xs: "size-3 border-2",
  sm: "size-5 border-2",
  md: "size-8 border-4",
  lg: "size-12 border-4",
  xl: "size-16 border-8",
};

const Spinner = ({ size = "md", color = "main" }) => {
  const spinnerClass = sizeClasses[size] || sizeClasses["md"];

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className={`inline-block ${spinnerClass} border-${color}-100 animate-spin rounded-full border-solid border-t-transparent`}
      ></div>
    </div>
  );
};

export default Spinner;
