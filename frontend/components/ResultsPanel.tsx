import type { StartTripResponse } from "@/lib/api";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

type ResultsPanelProps = {
  data: StartTripResponse | null;
  error: string | null;
};

export function ResultsPanel({ data, error }: ResultsPanelProps) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Results</h2>
        <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
          API response
        </span>
      </div>

      {error ? (
        <div className="mt-4 flex gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : data ? (
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium capitalize">{data.trip_status}</span>
          </div>
          <ResultRow label="Traveler" value={data.user_name} />
          <ResultRow label="Mode" value={data.trip_mode.replaceAll("_", " ")} />
          <ResultRow label="Trip ID" value={data.trip_id} wrap />
        </div>
      ) : (
        <div className="mt-4 flex gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500">
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
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2">
      <p className="text-xs font-medium uppercase text-zinc-500">{label}</p>
      <p
        className={`mt-1 font-medium text-zinc-900 ${wrap ? "break-all" : "capitalize"}`}
      >
        {value}
      </p>
    </div>
  );
}
