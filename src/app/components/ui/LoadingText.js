import React from "react";
import Spinner from "./Spinner";

const LoadingText = ({
  icon = false,
  loadingText = "Loading",
  defaultText = "",
  spinner: SpinnerComponent,
  isLoading = false,
}) => {
  return (
    <div className="flex items-center gap-2 text-main-300">
      {isLoading ? (
        SpinnerComponent ? (
          <SpinnerComponent size="xs" />
        ) : (
          <Spinner size="xs" />
        )
      ) : (
        icon
      )}
      <span className="min-w-fit">{isLoading ? loadingText : defaultText}</span>
    </div>
  );
};

export default LoadingText;
