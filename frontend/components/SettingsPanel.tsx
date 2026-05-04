"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save, Server } from "lucide-react";
import {
  getDefaultBackendUrl,
  getStoredBackendUrl,
  isValidBackendUrl,
  resetBackendUrl,
  saveBackendUrl,
} from "@/lib/settings";

type SettingsPanelProps = {
  onBackendUrlSaved?: (backendUrl: string) => void;
};

export function SettingsPanel({ onBackendUrlSaved }: SettingsPanelProps) {
  const [backendUrl, setBackendUrl] = useState(getStoredBackendUrl());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setBackendUrl(getStoredBackendUrl());
  }, []);

  function handleSave() {
    setError(null);
    setSuccess(null);

    if (!isValidBackendUrl(backendUrl)) {
      setError("Enter a valid backend URL, for example https://your-backend.onrender.com");
      return;
    }

    const savedUrl = saveBackendUrl(backendUrl);
    onBackendUrlSaved?.(savedUrl);
    setBackendUrl(savedUrl);
    setSuccess("Backend URL saved. The dashboard will use this value immediately.");
  }

  function handleReset() {
    setError(null);
    setSuccess(null);

    const defaultUrl = resetBackendUrl();
    onBackendUrlSaved?.(defaultUrl);
    setBackendUrl(defaultUrl);
    setSuccess("Backend URL reset to the default value.");
  }

  const defaultBackendUrl = getDefaultBackendUrl();

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
          <Server className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set the backend API URL used by the dashboard.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Backend URL
          <input
            value={backendUrl}
            onChange={(event) => {
              setBackendUrl(event.target.value);
              setError(null);
              setSuccess(null);
            }}
            placeholder="https://your-backend.onrender.com"
            className="mt-1.5 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-50 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
          />
        </label>

        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p>
            Current value: <span className="font-medium text-slate-900 dark:text-slate-50">{backendUrl || "not set"}</span>
          </p>
          <p>
            Default value: <span className="font-medium text-slate-900 dark:text-slate-50">{defaultBackendUrl}</span>
          </p>
          <p>
            Saved value is stored in your browser and used by all API calls.
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-800 dark:text-emerald-300">
            {success}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Save className="h-4 w-4" />
            Save URL
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 text-sm font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset default
          </button>
        </div>
      </div>
    </div>
  );
}