"use client";

import React, { useState, useEffect } from "react";

const PerformanceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async (type = "summary") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/line/performance?type=${type}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch("/api/v1/line/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clearCache", target: "ai" }),
      });

      const data = await response.json();
      if (data.success) {
        alert("AI cache cleared successfully!");
        fetchStats();
      } else {
        alert("Failed to clear cache: " + data.error);
      }
    } catch (err) {
      alert("Error clearing cache: " + err.message);
    }
  };

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(() => fetchStats(), 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusColor = (value, thresholds) => {
    if (typeof value === "string") {
      value = parseFloat(value);
    }

    if (value >= thresholds.danger) return "text-red-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading && !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
          <button onClick={() => fetchStats()} className="ml-4 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          LINE Bot AI Performance Dashboard
        </h1>
        <div className="flex gap-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto-refresh
          </label>
          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          <button
            onClick={clearCache}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear AI Cache
          </button>
        </div>
      </div>

      {/* Optimization Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Cache Hit Rate</h3>
          <p
            className={`text-2xl font-bold ${getStatusColor(
              parseFloat(stats?.optimization?.cacheHitRate),
              { warning: 30, danger: 10 }
            )}`}
          >
            {stats?.optimization?.cacheHitRate || "0%"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">
            Avg Response Time
          </h3>
          <p
            className={`text-2xl font-bold ${getStatusColor(
              parseFloat(stats?.optimization?.averageResponseTime),
              { warning: 1000, danger: 2000 }
            )}`}
          >
            {stats?.optimization?.averageResponseTime || "0ms"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">AI Timeout Rate</h3>
          <p
            className={`text-2xl font-bold ${getStatusColor(
              parseFloat(stats?.optimization?.aiTimeoutRate),
              { warning: 2, danger: 5 }
            )}`}
          >
            {stats?.optimization?.aiTimeoutRate || "0%"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.optimization?.totalRequests || 0}
          </p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cache Stats */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">AI Response Cache</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span className="font-medium">{stats?.cache?.size || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Hits:</span>
              <span className="font-medium text-green-600">
                {stats?.cache?.hits || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cache Misses:</span>
              <span className="font-medium text-red-600">
                {stats?.cache?.misses || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>AI Calls:</span>
              <span className="font-medium">
                {stats?.performance?.aiCalls || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>DB Queries:</span>
              <span className="font-medium">
                {stats?.performance?.databaseQueries || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg AI Time:</span>
              <span className="font-medium">
                {stats?.performance?.averageAITime || "0ms"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg DB Time:</span>
              <span className="font-medium">
                {stats?.performance?.averageDbTime || "0ms"}
              </span>
            </div>
          </div>
        </div>

        {/* Health Stats */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="font-medium">
                {stats?.health?.uptime || "0 hours"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span
                className={`font-medium ${getStatusColor(
                  parseFloat(stats?.health?.errorRate),
                  { warning: 2, danger: 5 }
                )}`}
              >
                {stats?.health?.errorRate || "0%"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Requests/Hour:</span>
              <span className="font-medium">
                {stats?.health?.requestsPerHour || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View More Details */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => fetchStats("full")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          View Full Report
        </button>
        <button
          onClick={() => fetchStats("cache")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Cache Details
        </button>
        <button
          onClick={() => fetchStats("performance")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Performance Details
        </button>
      </div>

      {/* Status Indicators */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Performance Indicators:</h4>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Good (&lt; 1000ms, &gt; 50% cache hit)
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            Warning (1000-2000ms, 30-50% cache hit)
          </span>
          <span className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            Critical (&gt; 2000ms, &lt; 30% cache hit)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
