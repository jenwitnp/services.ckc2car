import React from "react";

export default function AutoComplete({ mapData, isLoading, show }) {
  if (isLoading || !show) return null;
  return (
    <div className="flex-1">
      <ul className="absolute block left-0 z-10 w-full bg-main-800 border border-main-600 rounded shadow-lg max-h-56 overflow-auto">
        {mapData}
      </ul>
    </div>
  );
}

export function AutoCompleteList({ children, icon, disabled, ...props }) {
  return (
    <li
      {...props}
      className={`flex gap-4 justify-left items-center text-sm py-2 px-4 hover:bg-main-600 cursor-pointer
                ${disabled ? "opacity-50 pointer-events-none select-none" : ""}
            `}
    >
      {icon && <div className="block">{icon}</div>}
      {children}
    </li>
  );
}
