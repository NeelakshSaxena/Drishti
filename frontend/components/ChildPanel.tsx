"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight, Plus, CheckCircle2, Clock, MapPin, Battery, Wifi, Activity, ShieldCheck, PlayCircle, Smartphone } from "lucide-react";
import {
  startTrip,
  endTrip,
  addEvent,
  nextEvent,
  updateLocation,
  getChildDetails,
  type Child,
  type Trip,
  type EventRequest,
  type LocationData,
} from "@/lib/api";
import { useTelemetry } from "@/lib/useTelemetry";

type ChildPanelProps = {
  child: Child;
  onBack?: () => void;
};

export function ChildPanel({ child, onBack }: ChildPanelProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"trip" | "location" | "device">("device");
  const telemetry = useTelemetry(child.id);

  // Event form
  const [eventForm, setEventForm] = useState<EventRequest>({
    type: "flight",
    from: "",
    to: "",
    time: "",
    ticket_url: "",
  });
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Location form
  const [locationForm, setLocationForm] = useState({ lat: 28.6139, lng: 77.209 });
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [child.id]);

  async function loadData() {
    try {
      setError(null);
      const childData = await getChildDetails(child.id);
      if (childData.active_trip_id) {
        // In a real scenario, you'd fetch the trip details
        // For now, we'll update from the state
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStartTrip() {
    setIsLoading(true);
    try {
      setError(null);
      const newTrip = await startTrip(child.id);
      setTrip(newTrip);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start trip");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEndTrip() {
    if (!trip) return;
    setIsLoading(true);
    try {
      setError(null);
      const endedTrip = await endTrip(child.id);
      setTrip(endedTrip);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end trip");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!trip || !eventForm.from.trim() || !eventForm.to.trim()) return;

    setIsAddingEvent(true);
    try {
      setError(null);
      await addEvent(trip.id, eventForm);
      // Reload trip data
      const updatedTrip = { ...trip };
      // Note: In production, fetch the updated trip
      setTrip(updatedTrip);
      setEventForm({
        type: "flight",
        from: "",
        to: "",
        time: "",
        ticket_url: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add event");
    } finally {
      setIsAddingEvent(false);
    }
  }

  async function handleNextEvent() {
    if (!trip) return;
    setIsLoading(true);
    try {
      setError(null);
      const result = await nextEvent(trip.id);
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              current_event_index: result.current_event_index,
              status: result.trip_status,
            }
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to advance event");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateLocation(e: React.FormEvent) {
    e.preventDefault();
    setIsUpdatingLocation(true);
    try {
      setError(null);
      const loc = await updateLocation(child.id, locationForm.lat, locationForm.lng);
      setLocation(loc);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update location");
    } finally {
      setIsUpdatingLocation(false);
    }
  }

  const hasActiveTrip = trip?.status === "active";
  const currentEvent = trip?.events[trip.current_event_index];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {child.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {child.id}
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("trip")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "trip"
              ? "border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-600 dark:text-slate-400"
          }`}
        >
          Trip
        </button>
        <button
          onClick={() => setActiveTab("device")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
            activeTab === "device"
              ? "border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-600 dark:text-slate-400"
          }`}
        >
          Device Health
        </button>
      </div>

      {/* Trip Tab */}
      {activeTab === "trip" && (
        <div className="space-y-4">
          {!hasActiveTrip ? (
            <button
              onClick={handleStartTrip}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium transition inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Start Trip
            </button>
          ) : (
            <>
              {/* Current Event */}
              {currentEvent && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                      Current Event
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        currentEvent.status === "current"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : currentEvent.status === "completed"
                            ? "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {currentEvent.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {currentEvent.from}
                      </span>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                        {currentEvent.to}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <p className="uppercase font-medium text-xs mb-1">
                        {currentEvent.type}
                      </p>
                      {currentEvent.time && <p>{currentEvent.time}</p>}
                      {currentEvent.ticket_url && (
                        <a
                          href={currentEvent.ticket_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          View Ticket
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleNextEvent}
                    disabled={isLoading}
                    className="w-full mt-4 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin inline" />
                    ) : (
                      "Mark Complete & Next"
                    )}
                  </button>
                </div>
              )}

              {/* Add Event Form */}
              <form onSubmit={handleAddEvent} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, type: e.target.value })
                    }
                    className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                  >
                    <option value="flight">Flight</option>
                    <option value="train">Train</option>
                    <option value="bus">Bus</option>
                    <option value="car">Car</option>
                    <option value="hostel">Hostel</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    From
                    <input
                      type="text"
                      value={eventForm.from}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, from: e.target.value })
                      }
                      placeholder="e.g., NYC"
                      className="mt-1.5 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    To
                    <input
                      type="text"
                      value={eventForm.to}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, to: e.target.value })
                      }
                      placeholder="e.g., London"
                      className="mt-1.5 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Time (optional)
                  <input
                    type="datetime-local"
                    value={eventForm.time}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, time: e.target.value })
                    }
                    className="mt-1.5 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Ticket URL (optional)
                  <input
                    type="url"
                    value={eventForm.ticket_url}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, ticket_url: e.target.value })
                    }
                    placeholder="https://..."
                    className="mt-1.5 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isAddingEvent || !eventForm.from.trim() || !eventForm.to.trim()}
                  className="w-full px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition inline-flex items-center justify-center gap-2"
                >
                  {isAddingEvent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add Event
                </button>
              </form>

              {/* End Trip */}
              <button
                onClick={handleEndTrip}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin inline" />
                ) : (
                  "End Trip"
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Location Tab */}
      {activeTab === "location" && (
        <div className="space-y-4">
          <form onSubmit={handleUpdateLocation} className="space-y-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Latitude
              <input
                type="number"
                step="0.0001"
                value={locationForm.lat}
                onChange={(e) =>
                  setLocationForm({ ...locationForm, lat: parseFloat(e.target.value) })
                }
                className="mt-1.5 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Longitude
              <input
                type="number"
                step="0.0001"
                value={locationForm.lng}
                onChange={(e) =>
                  setLocationForm({ ...locationForm, lng: parseFloat(e.target.value) })
                }
                className="mt-1.5 h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
              />
            </label>

            <button
              type="submit"
              disabled={isUpdatingLocation}
              className="w-full px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition inline-flex items-center justify-center gap-2"
            >
              {isUpdatingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              Update Location
            </button>
          </form>

          {telemetry.location && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-600 dark:text-slate-400 space-y-2 mt-4">
              <p className="font-medium text-emerald-600">Live Telemetry Location:</p>
              <p>Latitude: {telemetry.location.lat}</p>
              <p>Longitude: {telemetry.location.lon}</p>
            </div>
          )}

          {location && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-medium">Last Manual Updated Location:</p>
              <p>Latitude: {location.lat}</p>
              <p>Longitude: {location.lng}</p>
              <p className="text-xs">{new Date(location.updated_at).toLocaleString()}</p>
            </div>
          )}
        </div>
      )}

      {/* Device Tab */}
      {activeTab === "device" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${telemetry.status === "online" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">Device Status</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{telemetry.status}</p>
              </div>
            </div>
            {telemetry.lastHeartbeat && (
              <div className="text-right">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Last Heartbeat</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(telemetry.lastHeartbeat).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Battery */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
              <Battery className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-50">Battery</h4>
                {telemetry.battery ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {telemetry.battery.level}% {telemetry.battery.is_charging ? "(Charging)" : ""}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Waiting for data...</p>
                )}
              </div>
            </div>

            {/* Network */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
              <Wifi className="h-5 w-5 text-indigo-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-50">Network</h4>
                {telemetry.network ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {telemetry.network.type} {telemetry.network.is_connected ? "(Connected)" : "(Disconnected)"}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Waiting for data...</p>
                )}
              </div>
            </div>

            {/* Media */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
              <PlayCircle className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-50">Media State</h4>
                {telemetry.media ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {telemetry.media.is_playing ? "Playing" : "Paused"} • Volume: {telemetry.media.volume}%
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Waiting for data...</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-50">Live Location</h4>
                {telemetry.location ? (
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {telemetry.location.lat.toFixed(4)}, {telemetry.location.lon.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">Waiting for data...</p>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h4 className="font-medium text-sm text-slate-900 dark:text-slate-50">Permission Health</h4>
            </div>
            {telemetry.permissions ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(telemetry.permissions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]" title={key}>
                      {key.split('.').pop()}
                    </span>
                    <span className={`font-medium ${value ? "text-emerald-600" : "text-red-500"}`}>
                      {value ? "Granted" : "Denied"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Waiting for data...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
