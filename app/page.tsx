"use client";

import { useState } from "react";

interface Result {
  endpoint: string;
  status: number;
  data: unknown;
  durationMs: number;
}

const ENDPOINTS = [
  {
    label: "Info Logs",
    path: "/api/log-info",
    description: "Emits structured info-level logs with request metadata.",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    badge: "bg-blue-100 text-blue-700",
    badgeLabel: "INFO",
  },
  {
    label: "Warn Logs",
    path: "/api/log-warn",
    description: "Emits warning logs for deprecated usage and rate limits.",
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    badge: "bg-yellow-100 text-yellow-700",
    badgeLabel: "WARN",
  },
  {
    label: "Error Logs",
    path: "/api/log-error",
    description: "Simulates a caught exception with full stack trace logged.",
    color: "bg-red-50 border-red-200 hover:bg-red-100",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "ERROR",
  },
  {
    label: "Slow Response",
    path: "/api/log-slow",
    description: "Adds a 2s artificial delay and logs a slow-response warning.",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    badge: "bg-purple-100 text-purple-700",
    badgeLabel: "WARN",
  },
  {
    label: "Stack Trace (NaN)",
    path: "/api/log-trace?price=abc&discount=10",
    description: "Passes invalid input through a 3-level call chain — Pino captures the full stack.",
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    badge: "bg-orange-100 text-orange-700",
    badgeLabel: "TRACE",
  },
  {
    label: "Stack Trace (RangeError)",
    path: "/api/log-trace?price=100&discount=999",
    description: "Triggers a RangeError deep in the call chain — stack trace shows exact throw site.",
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    badge: "bg-orange-100 text-orange-700",
    badgeLabel: "TRACE",
  },
];

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  async function trigger(path: string) {
    setLoading(path);
    const start = Date.now();
    try {
      const res = await fetch(path);
      const data = await res.json();
      setResults((prev) => [
        { endpoint: path, status: res.status, data, durationMs: Date.now() - start },
        ...prev,
      ]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vercel Logging MVP</h1>
          <p className="text-gray-500 text-sm">
            Click each button to fire an API route. All logs appear as structured JSON in{" "}
            <span className="font-medium text-gray-700">Vercel → Project → Logs</span>.
          </p>
        </div>

        <div className="grid gap-4 mb-10">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className={`flex items-center justify-between rounded-xl border px-5 py-4 transition-colors ${ep.color}`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${ep.badge}`}>
                  {ep.badgeLabel}
                </span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{ep.label}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{ep.description}</p>
                </div>
              </div>
              <button
                onClick={() => trigger(ep.path)}
                disabled={loading === ep.path}
                className="ml-4 shrink-0 rounded-lg bg-white border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading === ep.path ? "..." : "Trigger"}
              </button>
            </div>
          ))}
        </div>

        {results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Response Log
              </h2>
              <button
                onClick={() => setResults([])}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            </div>
            <div className="space-y-3">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-xs font-mono"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-bold ${r.status >= 500 ? "text-red-600" : "text-green-600"}`}
                    >
                      {r.status}
                    </span>
                    <span className="text-gray-500">{r.endpoint}</span>
                    <span className="ml-auto text-gray-400">{r.durationMs}ms</span>
                  </div>
                  <pre className="text-gray-600 whitespace-pre-wrap break-all">
                    {JSON.stringify(r.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
