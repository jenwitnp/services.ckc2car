"use client";

import React from "react";
import {
  MessageSquare,
  Settings,
  Trash2,
  Car,
  RefreshCw,
  ChevronUp,
} from "lucide-react";
import { CONSTANTS } from "../utils/constants";

const ChatHeader = ({
  isDesktop,
  showSettings,
  setShowSettings,
  clearChat,
  carContext,
  loadCarContext,
  aiConfig,
  setAiConfig,
}) => {
  const handleConfigChange = (key, value) => {
    setAiConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div
      className={`bg-success-700 text-white shadow-lg relative ${
        isDesktop ? "rounded-t-lg" : ""
      }`}
    >
      {/* Main Header */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg">CKC2Car AI</h1>
              <p className="text-xs text-white/80">Powered by โชคคูณโชค</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={clearChat}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Clear Chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Car Context Status */}
        <div className="mt-1">
          <div className="flex items-center space-x-2 p-1 rounded-lg text-xs text-white/80">
            <Car size={14} />
            <div className="flex-1">
              {carContext.isLoading ? (
                <span className="flex items-center">
                  <RefreshCw size={12} className="animate-spin mr-1" />
                  Loading car data...
                </span>
              ) : carContext.error ? (
                <span className="text-danger-300">
                  Error: {carContext.error}
                </span>
              ) : (
                <span className="text-success-300">
                  ✅ {carContext.carModels.length} models,{" "}
                  {carContext.branches.length} branches,{" "}
                  {carContext.carTypes.length} types
                </span>
              )}
            </div>
            <button
              onClick={loadCarContext}
              disabled={carContext.isLoading}
              className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
              title="Refresh car context"
            >
              <RefreshCw
                size={12}
                className={carContext.isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-white/20 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">AI Configuration</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <ChevronUp size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* Temperature */}
            <div>
              <label className="block text-white/80 mb-1">
                Temperature: {aiConfig.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={aiConfig.temperature}
                onChange={(e) =>
                  handleConfigChange("temperature", parseFloat(e.target.value))
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none slider"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-white/80 mb-1">
                Max Tokens: {aiConfig.maxTokens}
              </label>
              <input
                type="range"
                min="500"
                max="2000"
                step="100"
                value={aiConfig.maxTokens}
                onChange={(e) =>
                  handleConfigChange("maxTokens", parseInt(e.target.value))
                }
                className="w-full h-2 bg-white/20 rounded-lg appearance-none slider"
              />
            </div>

            {/* History Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-white/80">Enable History</span>
              <button
                onClick={() =>
                  handleConfigChange("enableHistory", !aiConfig.enableHistory)
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  aiConfig.enableHistory ? "bg-success-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    aiConfig.enableHistory ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Smart Caching Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-white/80">Smart Caching</span>
              <button
                onClick={() =>
                  handleConfigChange("smartCaching", !aiConfig.smartCaching)
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  aiConfig.smartCaching ? "bg-success-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    aiConfig.smartCaching ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <button
              onClick={() => setAiConfig(CONSTANTS.DEFAULTS.AI_CONFIG)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
