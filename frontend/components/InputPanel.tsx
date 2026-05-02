"use client";

import { useState } from "react";
import { Loader2, MapPinned } from "lucide-react";

import type { StartTripPayload } from "@/lib/api";

type InputPanelProps = {
  isLoading: boolean;
  onSubmit: (payload: StartTripPayload) => void;
};

export function InputPanel({ isLoading, onSubmit }: InputPanelProps) {
  const [userName, setUserName] = useState("Traveler");
  const [tripMode, setTripMode] = useState("on_trip");
  const [originLat, setOriginLat] = useState(28.6139);
  const [originLon, setOriginLon] = useState(77.209);
  const [destinationLat, setDestinationLat] = useState(28.5562);
  const [destinationLon, setDestinationLon] = useState(77.1);

  function handleSubmit() {
    onSubmit({
      user_name: userName,
      trip_mode: tripMode,
      segments: [
        {
          type: "road",
          status: "active",
          details: {
            from: "Origin",
            to: "Destination",
          },
          verifiedData: {
            coords: {
              departure: [originLat, originLon],
              arrival: [destinationLat, destinationLon],
            },
          },
        },
      ],
    });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <MapPinned className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold">Trip Setup</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Send a route sample to the backend.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-sm font-medium text-zinc-700">
          Name
          <input
            value={userName}
            onChange={(event) => setUserName(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block text-sm font-medium text-zinc-700">
          Trip mode
          <select
            value={tripMode}
            onChange={(event) => setTripMode(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="on_trip">On trip</option>
            <option value="returning_home">Returning home</option>
          </select>
        </label>

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-zinc-800">Coordinates</h3>
            <span className="text-xs font-medium text-zinc-500">lat / lon</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <NumberField label="Origin lat" value={originLat} onChange={setOriginLat} />
          <NumberField label="Origin lon" value={originLon} onChange={setOriginLon} />
          <NumberField
            label="Dest lat"
            value={destinationLat}
            onChange={setDestinationLat}
          />
          <NumberField
            label="Dest lon"
            value={destinationLon}
            onChange={setDestinationLon}
          />
          </div>
        </div>

        <button
          type="button"
          data-testid="start-trip-button"
          onClick={handleSubmit}
          disabled={isLoading || !userName.trim()}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Sending..." : "Start trip"}
        </button>
      </div>
    </section>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <input
        type="number"
        step="any"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1.5 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}
