"use client";

import { Button } from "@/components/ui/button";
import { Bell, BatteryCharging, Signal, RefreshCw, Clock, Footprints, Menu, X, Map as MapIcon } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drishti-walb.onrender.com';

export default function Page() {
  const [parentName, setParentName] = useState<string>('Parent');
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [lastPing, setLastPing] = useState<string>('—');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboard = async () => {
    const parentId = localStorage.getItem('parent_id');
    if (!parentId) return;
    try {
      const res = await fetch(`${API_URL}/family/parent/dashboard?parent_id=${parentId}`);
      const data = await res.json();
      if (data.parent?.name) setParentName(data.parent.name);
      if (data.linked_children?.length > 0) {
        setSelectedChild((prev: any) => {
          const updated = data.linked_children.find((c: any) => c.id === prev?.id);
          return updated ?? data.linked_children[0];
        });
        setLastPing(new Date().toLocaleTimeString());
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const name = localStorage.getItem('parent_name');
    if (name) setParentName(name);
    fetchDashboard();
    intervalRef.current = setInterval(fetchDashboard, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const childIsSharing = selectedChild?.is_sharing === true || selectedChild?.is_sharing === 1;

  // Live marker only when actively sharing
  const childLocation = childIsSharing && selectedChild?.lat != null && selectedChild?.lon != null
    ? { lat: selectedChild.lat, lon: selectedChild.lon, label: selectedChild.name }
    : null;

  // Last recorded location (shown on map even when offline)
  const lastRecordedLocation = !childIsSharing && selectedChild?.lat != null && selectedChild?.lon != null
    ? { lat: selectedChild.lat, lon: selectedChild.lon, label: `${selectedChild.name} (last recorded)` }
    : null;

  const displayLocation = childLocation ?? lastRecordedLocation ?? null;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-4 sm:px-6 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 text-white shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-black text-lg tracking-widest uppercase">Drishti</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden sm:flex items-center gap-4 text-zinc-500">
            <Bell className="w-5 h-5" />
            <BatteryCharging className="w-5 h-5" />
            <Signal className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold">
            {parentName[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left column / sidebar */}
        <section className={`
          fixed lg:relative inset-y-0 left-0 z-30
          w-[280px] sm:w-80 border-r border-zinc-800 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto bg-zinc-950
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-14 lg:top-0
        `}>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome, {parentName}</h2>
            <p className="text-zinc-500 text-sm mt-1">Monitor active movements in real-time.</p>
          </div>

          {/* "You are watching" */}
          <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 space-y-1">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest">You are watching</span>
            {selectedChild ? (
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${childIsSharing ? 'bg-emerald-500 animate-pulse' : lastRecordedLocation ? 'bg-amber-500' : 'bg-zinc-600'}`} />
                <p className="text-white font-bold text-xl">{selectedChild.name}</p>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm mt-1">No child linked yet.</p>
            )}
          </div>

          {/* Child status */}
          {selectedChild && (
            <div className="border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <span className="text-[10px] text-white uppercase tracking-widest font-bold">Child Status</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${childIsSharing ? 'bg-emerald-900 text-emerald-400' : lastRecordedLocation ? 'bg-amber-900/50 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {childIsSharing ? 'LIVE' : lastRecordedLocation ? 'LAST KNOWN' : 'OFFLINE'}
                </span>
              </div>
              {displayLocation ? (
              <>
                {!childIsSharing && lastRecordedLocation && (
                  <div className="flex items-center gap-1.5 text-amber-400/80 bg-amber-950/20 border border-amber-900/40 rounded-lg px-2 py-1.5 mb-1">
                    <span className="text-[10px]">📍 Not sharing live — showing last recorded location</span>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Footprints className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Location</p>
                    <p className="text-white text-xs font-medium">{selectedChild.lat?.toFixed(4)}, {selectedChild.lon?.toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Last Updated</p>
                    <p className="text-white text-xs font-medium">{lastPing}</p>
                  </div>
                </div>
              </>
              ) : (
                <p className="text-zinc-500 text-xs">Ask {selectedChild.name} to enable location sharing.</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/30 border border-zinc-800 p-3 rounded-lg">
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Battery</p>
              <div className="flex items-center gap-1">
                <BatteryCharging className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-bold text-white">84%</span>
              </div>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800 p-3 rounded-lg">
              <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">ETA Home</p>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-bold text-white">—</span>
              </div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="flex-1 relative bg-zinc-900 overflow-hidden">
          <div className="absolute inset-0">
            <MapView interactive={true} centerPoint={displayLocation} />
          </div>
          <div className="absolute top-4 left-4 z-20">
            <div className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 backdrop-blur bg-zinc-950/80 ${childIsSharing ? 'border-emerald-800' : lastRecordedLocation ? 'border-amber-800' : 'border-zinc-700'}`}>
              <div className={`w-2 h-2 rounded-full ${childIsSharing ? 'bg-emerald-500 animate-pulse' : lastRecordedLocation ? 'bg-amber-500' : 'bg-zinc-600'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                {childIsSharing
                  ? `Tracking ${selectedChild?.name}`
                  : lastRecordedLocation
                    ? `Last known · ${selectedChild?.name}`
                    : 'No Location Data'}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom bar */}
      <footer className="shrink-0 z-50 flex flex-col sm:flex-row items-stretch sm:items-center h-auto sm:h-20 px-4 sm:px-8 py-3 sm:py-0 bg-zinc-950 border-t border-zinc-800 gap-3 sm:gap-4">
        <div className="flex-1 flex gap-3 sm:gap-4 overflow-x-auto">
          <div className="border border-zinc-800 rounded-md px-3 sm:px-5 py-2 flex flex-col items-start shrink-0">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Last Ping</span>
            <span className="text-white text-xs font-bold">{lastPing}</span>
          </div>
          <div className="border border-zinc-800 rounded-md px-3 sm:px-5 py-2 flex flex-col items-start shrink-0">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Monitoring</span>
            <span className="text-white text-xs font-bold">{selectedChild?.name ?? 'No child'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={fetchDashboard} className="h-10 border-zinc-800 text-zinc-400 hover:border-white hover:text-white gap-2 text-xs sm:text-sm flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">Refresh</span>
          </Button>
          <Button className="h-10 bg-white text-black hover:bg-zinc-200 gap-2 flex-1 sm:flex-none">
            <Bell className="w-4 h-4 text-red-500" />
            <span className="text-[11px] font-bold text-black uppercase tracking-widest">Notify</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}
