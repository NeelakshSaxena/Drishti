import type { StartTripResponse } from "@/lib/api";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

type ResultsPanelProps = {
  data: StartTripResponse | null;
  error: string | null;
};

export function ResultsPanel({ data, error }: ResultsPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">Results</h2>
        <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
          API response
        </span>
      </div>

      {error ? (
        <div className="mt-4 flex gap-3 rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : data ? (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 px-3 py-2 text-green-800 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium capitalize">{data.trip_status}</span>
          </div>
          <ResultRow label="Traveler" value={data.user_name} />
          <ResultRow label="Mode" value={data.trip_mode.replaceAll("_", " ")} />
          <ResultRow label="Trip ID" value={data.trip_id} wrap />
        </div>
      ) : (
        <div className="mt-4 flex gap-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-500 dark:text-slate-400">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>No response yet.</p>
        </div>
      )}
    </section>
  );
}

type ResultRowProps = {
  label: string;
  value: string;
  wrap?: boolean;
};

function ResultRow({ label, value, wrap = false }: ResultRowProps) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-3 py-2">
      <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{label}</p>
      <p
        className={`mt-1 font-medium text-slate-900 dark:text-slate-50 ${wrap ? "break-all" : "capitalize"}`}
      >
        {value}
      </p>
    </div>
  );
}
