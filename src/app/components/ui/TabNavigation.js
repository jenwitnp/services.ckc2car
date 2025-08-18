"use client";

import { useState } from "react";

export default function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`py-2 px-4 font-medium text-sm mr-2 focus:outline-none transition-colors ${
            activeTab === tab.id
              ? `text-${tab.color}-600 border-b-2 border-${tab.color}-600`
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
