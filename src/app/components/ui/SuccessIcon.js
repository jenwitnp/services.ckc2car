export default function SuccessIcon() {
  return (
    <div className="relative w-[18px] h-[18px] bg-green-500 rounded-full flex items-center justify-center">
      {/* Circle */}

      {/* Checkmark */}
      <svg className="absolute inset-0" viewBox="2 2 20 20">
        <path
          d="M6 12l4 4L18 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white animate-checkmark"
        />
      </svg>
    </div>
  );
}
