"use client";

import { useState } from "react";
import { InputPanel } from "@/components/InputPanel";
import { MapView } from "@/components/MapView";
import { ResultsPanel } from "@/components/ResultsPanel";
import { startTripLegacy, type StartTripResponse, type StartTripPayload } from "@/lib/api";

export default function LegacyPage() {
  const [result, setResult] = useState<StartTripResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleStartTrip(payload: StartTripPayload) {
    setIsLoading(true);
    setError(null);

    try {
      setResult(await startTripLegacy(payload));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 transition-colors">
      <header className="sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-normal">Drishti</h1>
            <p className="text-xs font-medium uppercase text-emerald-700 dark:text-emerald-400">
              Trip verification (Legacy)
            </p>
          </div>
          <span className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            Verification
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-5 lg:sticky lg:top-24">
          <InputPanel isLoading={isLoading} onSubmit={handleStartTrip} />
          <ResultsPanel data={result} error={error} />
        </aside>

        <section className="min-h-[520px] overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-2 shadow-sm sm:p-3">
          <MapView centerPoint={null} />
        </section>
      </div>
    </main>
  );
}
