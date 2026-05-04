"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, MapPin, Clock, AlertCircle } from "lucide-react";
import {
  getChildren,
  createChild,
  startTrip,
  endTrip,
  type Child,
  type Trip,
} from "@/lib/api";
import { UI_CONFIG, FORM_CONSTRAINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants";

type ParentDashboardProps = {
  onSelectChild?: (child: Child) => void;
};

/**
 * Parent Dashboard - Displays children list and trip controls
 */
export function ParentDashboard({ onSelectChild }: ParentDashboardProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [trips, setTrips] = useState<Record<string, Trip>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  useEffect(() => {
    loadChildren();
    const interval = setInterval(loadChildren, UI_CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  /**
   * Loads children from API
   */
  async function loadChildren() {
    try {
      setError(null);
      const data = await getChildren();
      setChildren(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Creates a new child with validation
   */
  async function handleCreateChild() {
    const trimmedName = newChildName.trim();

    // Validation
    if (!trimmedName) {
      setError(ERROR_MESSAGES.CHILD_NAME_REQUIRED);
      return;
    }

    if (trimmedName.length > FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH) {
      setError(ERROR_MESSAGES.CHILD_NAME_TOO_LONG);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createChild(trimmedName);
      setNewChildName("");
      await loadChildren();
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsCreating(false);
    }
  }

  /**
   * Starts a trip for a child
   */
  async function handleStartTrip(childId: string) {
    setLoadingAction(`start-${childId}`);
    setError(null);

    try {
      const trip = await startTrip(childId);
      setTrips((prev) => ({ ...prev, [childId]: trip }));
      await loadChildren();
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoadingAction(null);
    }
  }

  /**
   * Ends a trip for a child
   */
  async function handleEndTrip(childId: string) {
    setLoadingAction(`end-${childId}`);
    setError(null);

    try {
      const trip = await endTrip(childId);
      setTrips((prev) => ({ ...prev, [childId]: trip }));
      await loadChildren();
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Create Child Section */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-50">
            Add Child
          </h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newChildName}
            onChange={(e) => {
              setNewChildName(e.target.value);
              setError(null); // Clear error when user types
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleCreateChild();
            }}
            placeholder="Enter child's name"
            maxLength={FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH}
            disabled={isCreating}
            className="flex-1 h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 disabled:bg-slate-100 dark:disabled:bg-slate-800"
          />
          <button
            onClick={handleCreateChild}
            disabled={isCreating || !newChildName.trim()}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add
              </>
            )}
          </button>
        </div>
        {/* Character counter */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {newChildName.length} / {FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-200">Error</p>
            <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Loading children...
            </span>
          </div>
        </div>
      ) : children.length === 0 ? (
        // Empty State
        <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Plus className="h-6 w-6 text-slate-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-1">
            No children yet
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Create a child using the form above to get started
          </p>
        </div>
      ) : (
        // Children List
        <div className="space-y-3">
          {children.map((child) => {
            const hasActiveTrip = !!child.active_trip_id;
            const isLoadingStart = loadingAction === `start-${child.id}`;
            const isLoadingEnd = loadingAction === `end-${child.id}`;

            return (
              <div
                key={child.id}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => onSelectChild?.(child)}>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-50 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                      {child.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        {hasActiveTrip ? (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Trip active</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-3 w-3" />
                            <span>No trip</span>
                          </>
                        )}
                      </div>
                      <span>ID: {child.id.slice(0, 8)}...</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!hasActiveTrip ? (
                      <button
                        onClick={() => handleStartTrip(child.id)}
                        disabled={isLoadingStart || isLoadingEnd}
                        className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium transition disabled:opacity-50"
                      >
                        {isLoadingStart ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3" />
                        )}
                        Start Trip
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEndTrip(child.id)}
                        disabled={isLoadingStart || isLoadingEnd}
                        className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium transition disabled:opacity-50"
                      >
                        {isLoadingEnd ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        End Trip
                      </button>
                    )}

                    <button
                      onClick={() => onSelectChild?.(child)}
                      className="inline-flex items-center gap-1 px-3 h-9 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
