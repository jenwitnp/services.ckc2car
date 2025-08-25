import { cloneElement } from "react";

function InputRow({
  label = false,
  children,
  isError,
  id,
  direction = "column",
  required = false,
  isShowError = false,
}) {
  const errorMsg = isError?.[id]?.message;
  const hasError = !!errorMsg;

  return (
    <div
      className={`relative mb-5 flex ${
        direction === "row"
          ? "flex-row items-center justify-start gap-3 md:gap-4"
          : "flex-col items-start justify-start gap-2"
      }`}
    >
      {label && (
        <label
          className={`text-sm font-medium transition-colors ${
            hasError ? "text-danger-600" : "text-main-700"
          }`}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex w-full flex-col">
        {cloneElement(children, { error: errorMsg || undefined })}
        {/* Error message display */}
        {errorMsg && isShowError && (
          <p className="text-sm text-danger-600 mt-1 flex items-center">
            <svg
              className="h-4 w-4 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}

export default InputRow;
