import { cloneElement } from "react";

function InputRow({
  label = false,
  children,
  isError,
  id,
  direction = "column",
}) {
  const errorMsg = isError?.[id]?.message;
  return (
    <div
      className={`relative mb-5 flex ${
        direction === "row"
          ? "flex-row items-center justify-start gap-3 md:gap-4"
          : "flex-col items-start justify-start gap-2"
      }`}
    >
      {label && (
        <label className="text-sm text-main-300 font-medium">{label}</label>
      )}
      <div className="flex w-full">
        {cloneElement(children, { error: errorMsg || undefined })}
      </div>
    </div>
  );
}

export default InputRow;
