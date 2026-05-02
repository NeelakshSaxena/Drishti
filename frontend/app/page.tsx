"use client";

import { useState } from "react";

import { InputPanel } from "@/components/InputPanel";
import { MapView } from "@/components/MapView";
import { ResultsPanel } from "@/components/ResultsPanel";
import { StartTripResponse, startTrip, type StartTripPayload } from "@/lib/api";

export default function Home() {
  const [result, setResult] = useState<StartTripResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleStartTrip(payload: StartTripPayload) {
    setIsLoading(true);
    setError(null);

    try {
      setResult(await startTrip(payload));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-normal">Drishti</h1>
            <p className="text-xs font-medium uppercase text-emerald-700">
              Trip intelligence dashboard
            </p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm font-medium text-zinc-600">
            Dashboard
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-5 lg:sticky lg:top-24">
          <InputPanel isLoading={isLoading} onSubmit={handleStartTrip} />
          <ResultsPanel data={result} error={error} />
        </aside>

        <section className="min-h-[520px] overflow-hidden rounded-lg border border-zinc-200 bg-white p-2 shadow-sm sm:p-3">
          <MapView data={result} />
        </section>
      </div>
    </main>
  );
}
