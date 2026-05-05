"use client";

import { Button } from "@/components/ui/button";
import { Footprints, Plus, Search, ChevronDown, BatteryCharging, ExternalLink, Bell, RefreshCw, HelpCircle, Clock, Bus, Settings, Receipt, Minus, Locate } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const [parentName, setParentName] = useState<string>('Parent');
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [allChildren, setAllChildren] = useState<any[]>([]);
  const [lastPing, setLastPing] = useState<string>('—');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboard = async () => {
    const parentId = localStorage.getItem('parent_id');
    if (!parentId) return;
    try {
      const res = await fetch(`http://localhost:8000/family/parent/dashboard?parent_id=${parentId}`);
      const data = await res.json();
      if (data.parent?.name) setParentName(data.parent.name);
      if (data.linked_children && data.linked_children.length > 0) {
        setAllChildren(data.linked_children);
        setSelectedChild((prev: any) => {
          if (!prev) return data.linked_children[0];
          // Update selected child with fresh data (preserves lat/lon)
          const updated = data.linked_children.find((c: any) => c.id === prev.id);
          return updated ?? data.linked_children[0];
        });
        setLastPing(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Dashboard fetch failed:', e);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem('parent_name');
    if (name) setParentName(name);

    fetchDashboard(); // Initial load
    intervalRef.current = setInterval(fetchDashboard, 5000); // Poll every 5s

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Build location point for MapView
  const childLocation =
    selectedChild?.lat != null && selectedChild?.lon != null
      ? { lat: selectedChild.lat, lon: selectedChild.lon, label: selectedChild.name }
      : null;

  return (
    <>
      {/* Top App Bar */}
      <header className="flex items-center justify-between w-full px-6 h-14 border-b border-zinc-800 bg-neutral-950/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-4">
          <span className="font-inter text-xs font-medium uppercase tracking-widest text-white">Trip Monitor</span>
          <div className="h-4 w-[1px] bg-zinc-800"></div>
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1 gap-2">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              className="bg-transparent border-none text-[10px] text-white focus:ring-0 w-32 placeholder-zinc-600 uppercase tracking-tighter outline-none"
              placeholder="Search coordinates..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="h-7 text-[10px] font-bold px-4 rounded-md uppercase tracking-widest">
            Emergency
          </Button>
          <Settings className="w-5 h-5 text-white cursor-pointer" />
          <HelpCircle className="w-5 h-5 text-white cursor-pointer" />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="w-full h-[calc(100vh-3.5rem-4rem)] flex overflow-hidden">
        {/* LEFT COLUMN: Control Panel */}
        <section className="w-80 border-r border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto z-10 bg-zinc-950">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Welcome, {parentName}</h2>
            <p className="text-zinc-500 text-sm">Monitor active movements in real-time.</p>
          </div>

          {/* Child selector */}
          <div className="space-y-2">
            <label className="text-zinc-500 text-[10px] uppercase tracking-widest">Active Monitoring</label>
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between bg-zinc-900 border-zinc-800 h-12 rounded-lg text-sm text-white hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${childLocation ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></span>
                  <span>{selectedChild ? selectedChild.name : 'No child linked'}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Location Card */}
          {selectedChild && (
            <div className="bg-transparent border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-[10px] text-white uppercase tracking-widest font-bold">Child Status</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${childLocation ? 'bg-emerald-900 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                  {childLocation ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>

              {childLocation ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Footprints className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Location</p>
                      <p className="text-white font-medium text-xs">
                        {selectedChild.lat?.toFixed(4)}, {selectedChild.lon?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest">Last Updated</p>
                      <p className="text-white font-medium text-xs">{lastPing}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-xs">Location not available yet. Ask the child to enable sharing.</p>
              )}
            </div>
          )}

          {/* Status Metrics */}
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

        {/* RIGHT COLUMN: Main Map View */}
        <section className="flex-1 relative bg-zinc-900 overflow-hidden">
          <div className="absolute inset-0">
            <MapView interactive={true} centerPoint={childLocation} />
          </div>

          {/* Live tracking badge */}
          <div className="absolute top-4 left-4 z-20">
            <div className={`border rounded-lg px-3 py-1.5 flex items-center gap-2 backdrop-blur bg-zinc-950/80 ${childLocation ? 'border-emerald-800' : 'border-zinc-700'}`}>
              <div className={`w-2 h-2 rounded-full ${childLocation ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                {childLocation ? `Tracking ${selectedChild?.name ?? 'Child'}` : 'No Location Data'}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 right-0 left-0 z-50 flex justify-center gap-4 items-center h-16 px-8 bg-zinc-950 border-t border-zinc-800">
        <div className="flex-1 flex gap-4">
          <div className="border border-zinc-800 rounded-md px-6 py-2 flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Last Ping</span>
            <span className="text-white text-xs font-bold">{lastPing || '—'}</span>
          </div>
          <div className="border border-zinc-800 rounded-md px-6 py-2 flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Monitoring</span>
            <span className="text-white text-xs font-bold">{selectedChild?.name ?? 'No child'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={fetchDashboard}
            className="h-10 border-zinc-800 text-zinc-400 hover:border-white hover:text-white transition-all gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Refresh</span>
          </Button>
          <Button variant="secondary" className="h-10 bg-white border-red-500 text-red-500 hover:border-red-600 hover:text-red-600 transition-all gap-2">
            <Bell className="w-4 h-4" color="red" />
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Send Notification</span>
          </Button>
        </div>
      </footer>
    </>
  );
}
