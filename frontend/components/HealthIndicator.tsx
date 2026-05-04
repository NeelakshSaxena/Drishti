"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { healthCheck, type HealthCheckResponse } from "@/lib/api";

type HealthIndicatorProps = {
  autoRefresh?: boolean;
  interval?: number;
  refreshKey?: string;
};

export function HealthIndicator({
  autoRefresh = true,
  interval = 15000,
  refreshKey,
}: HealthIndicatorProps) {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      setIsChecking(true);
      try {
        const result = await healthCheck();
        setHealth(result);
      } catch (error) {
        setHealth({
          status: "error",
          backend: "unreachable",
          services: { api: false, memory_store: false },
          errors: ["Connection failed"],
        });
      } finally {
        setIsChecking(false);
      }
    }

    checkHealth();

    if (autoRefresh) {
      const timer = setInterval(checkHealth, interval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, interval, refreshKey]);

  if (!health) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        <span className="text-xs font-medium">Checking...</span>
      </div>
    );
  }

  const isHealthy = health.status === "ok";
  const isDegraded = health.status === "degraded";

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md">
      {isHealthy ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-xs font-medium text-green-700 dark:text-green-300">
            Connected
          </span>
        </>
      ) : isDegraded ? (
        <>
          <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Degraded
          </span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-xs font-medium text-red-700 dark:text-red-300">
            Offline
          </span>
        </>
      )}
    </div>
  );
}
