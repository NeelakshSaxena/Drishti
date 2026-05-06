"use client";

import { MapView } from '@/components/MapView';
import { useEffect, useRef, useState } from 'react';
import { Eye, Clock, Footprints, Users, AlertTriangle, WifiOff, ChevronUp, ChevronDown } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drishti-walb.onrender.com';

type GuestData = {
  child_name: string;
  parent_name: string | null;
  lat: number | null;
  lon: number | null;
  is_sharing: boolean;
  location_updated_at: string | null;
  current_trip: any | null;
  trip_history: any[];
};

// Next.js 14: params is a plain sync object, NOT a Promise
export default function GuestPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [data, setData] = useState<GuestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPing, setLastPing] = useState<string>('—');
  const [panelOpen, setPanelOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/family/guest/${token}`);
      if (!res.ok) {
        setError('This link is invalid or has expired (links expire after 48 hours).');
        return;
      }
      const json = await res.json();
      setData(json);
      setLastPing(new Date().toLocaleTimeString());
    } catch {
      setError('Could not connect to server. Please try again later.');
    }
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [token]);

  // Only show map marker if actively sharing
  const location = data?.is_sharing && data?.lat != null && data?.lon != null
    ? { lat: data.lat, lon: data.lon, label: data.child_name }
    : null;

  // Last recorded location (even when not actively sharing)
  const lastRecorded = !data?.is_sharing && data?.lat != null && data?.lon != null
    ? { lat: data.lat, lon: data.lon, label: `${data.child_name} (last recorded)` }
    : null;

  const displayLocation = location ?? lastRecorded ?? null;

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-white text-2xl font-bold">Link Unavailable</h1>
          <p className="text-zinc-400 max-w-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse" />
          <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-zinc-500 rounded-full animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shrink-0 z-30">
        <span className="font-black text-lg tracking-widest uppercase text-white">Drishti</span>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-2 sm:px-3 py-1.5">
          <Eye className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">Guest View · Read Only</span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest sm:hidden">Guest</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* Info sidebar – becomes bottom drawer on mobile */}
        <aside className={`
          lg:w-72 lg:border-r lg:border-zinc-800 lg:overflow-y-auto lg:shrink-0 bg-zinc-950
          fixed lg:relative bottom-0 left-0 right-0 lg:inset-auto z-20
          transform transition-transform duration-300 ease-in-out
          ${panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)] lg:translate-y-0'}
          max-h-[70vh] lg:max-h-none
          rounded-t-2xl lg:rounded-none border-t lg:border-t-0 border-zinc-700
        `}>
          {/* Mobile drag handle */}
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="lg:hidden w-full flex items-center justify-center py-2 text-zinc-400"
          >
            {panelOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>

          <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 overflow-y-auto">
            <div>
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Viewing location of</p>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{data.child_name}</h1>
            </div>

            {/* Linked guardian */}
            <div className="border border-zinc-800 rounded-xl p-3 sm:p-4 bg-zinc-900/30">
              <span className="text-zinc-500 text-[10px] uppercase tracking-widest block mb-2">Linked Guardian</span>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-white font-medium text-sm">{data.parent_name ?? 'Unknown'}</span>
              </div>
            </div>

            {/* Location status */}
            <div className="border border-zinc-800 rounded-xl p-3 sm:p-4 bg-zinc-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white uppercase tracking-widest font-bold">Location</span>
                {data.is_sharing ? (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-900 text-emerald-400">LIVE</span>
                ) : displayLocation ? (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-900/50 text-amber-400">LAST KNOWN</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-400">OFFLINE</span>
                )}
              </div>

              {displayLocation ? (
                <>
                  {!data.is_sharing && (
                    <div className="flex items-center gap-1.5 text-amber-400/80 bg-amber-950/20 border border-amber-900/40 rounded-lg px-2 py-1.5">
                      <WifiOff className="w-3 h-3 shrink-0" />
                      <p className="text-[10px]">Not sharing live — showing last recorded location</p>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <Footprints className="w-4 h-4 text-zinc-400 mt-0.5" />
                    <div>
                      <p className="text-zinc-500 text-[9px] uppercase tracking-widest">Coordinates</p>
                      <p className="text-white text-xs font-mono">{data.lat?.toFixed(5)}, {data.lon?.toFixed(5)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-zinc-400 mt-0.5" />
                    <div>
                      <p className="text-zinc-500 text-[9px] uppercase tracking-widest">
                        {data.is_sharing ? 'Last Ping' : 'Recorded At'}
                      </p>
                      <p className="text-white text-xs">
                        {data.is_sharing
                          ? lastPing
                          : data.location_updated_at
                            ? new Date(data.location_updated_at).toLocaleString()
                            : '—'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-zinc-500 text-xs">Location sharing is off and no location has been recorded.</p>
              )}
            </div>

            {/* Trip status */}
            <div className="border border-zinc-800 rounded-xl p-3 sm:p-4 bg-zinc-900/30">
              <span className="text-[10px] text-white uppercase tracking-widest font-bold block mb-2">Trip Status</span>
              {data.current_trip ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 text-xs font-bold">Active Trip</span>
                  </div>
                  <p className="text-zinc-400 text-xs">Events: {data.current_trip.events?.length ?? 0}</p>
                  <p className="text-zinc-500 text-[10px]">
                    Started: {new Date(data.current_trip.started_at).toLocaleTimeString()}
                  </p>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs">No active trip.</p>
              )}
            </div>

            {/* Trip history */}
            {data.trip_history?.length > 0 && (
              <div className="border border-zinc-800 rounded-xl p-3 sm:p-4 bg-zinc-900/30">
                <span className="text-[10px] text-white uppercase tracking-widest font-bold block mb-2">
                  Trip History ({data.trip_history.length})
                </span>
                <div className="space-y-2">
                  {data.trip_history.slice(-3).reverse().map((trip: any, i: number) => (
                    <div key={i} className="text-xs text-zinc-400 border-b border-zinc-800 pb-2 last:border-0">
                      <p className="text-zinc-300 font-medium">
                        {trip.status === 'ended' ? 'Completed trip' : 'Trip'}
                      </p>
                      <p className="text-zinc-500 text-[10px]">
                        {new Date(trip.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-600 text-[10px] text-center leading-relaxed">
                Read-only guest view shared by {data.child_name}. Link expires 48h after creation.
              </p>
            </div>
          </div>
        </aside>

        {/* Map – shows last recorded even if not live */}
        <section className="flex-1 relative overflow-hidden">
          <MapView interactive={true} centerPoint={displayLocation} />
          {!data.is_sharing && displayLocation && (
            <div className="absolute top-4 left-4 z-20 bg-zinc-950/90 backdrop-blur border border-amber-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Last Recorded Location</span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
