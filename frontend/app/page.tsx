"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Map } from "lucide-react";
import { HealthIndicator } from "@/components/HealthIndicator";
import { ParentDashboard } from "@/components/ParentDashboard";
import { ChildPanel } from "@/components/ChildPanel";
import { MapView } from "@/components/MapView";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { Child } from "@/lib/api";
import { UI_CONFIG } from "@/lib/constants";

/**
 * Main dashboard page
 * Displays parent view or child view based on selection
 */
export default function Home() {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Apply dark mode to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Drishti
              </h1>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Child Trip Management Dashboard
              </p>
            </div>

            <div className="flex items-center gap-3">
              <HealthIndicator autoRefresh interval={UI_CONFIG.AUTO_REFRESH_INTERVAL} />

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition"
                title={darkMode ? "Light mode" : "Dark mode"}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {selectedChild ? (
            // Child Detail View
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              <div>
                <ChildPanel
                  child={selectedChild}
                  onBack={() => setSelectedChild(null)}
                />
              </div>
              <div className="min-h-[500px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <MapView data={null} />
              </div>
            </div>
          ) : (
            // Parent Dashboard View
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              <div>
                <ParentDashboard onSelectChild={setSelectedChild} />
              </div>
              <div>
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                      <Map className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Quick Info
                    </h2>
                  </div>

                  <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50 mb-1">
                        How to Use:
                      </p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Create children using the form above</li>
                        <li>Click on a child to manage their trip</li>
                        <li>Start trips and add events</li>
                        <li>Track real-time locations</li>
                        <li>Auto-refresh every 15 seconds</li>
                      </ul>
                    </div>

                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <p className="font-medium text-slate-900 dark:text-slate-50 mb-2">
                      Event Types:
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {[
                        "Flight",
                        "Train",
                        "Bus",
                        "Car",
                        "Hostel",
                        "Hotel",
                      ].map((type) => (
                        <div
                          key={type}
                          className="px-2 py-1 rounded bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-3">
                    <p className="text-emerald-900 dark:text-emerald-300 text-xs">
                      ✓ All data is saved automatically. Changes sync with the
                      backend every 15 seconds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
