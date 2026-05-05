"use client";

import { Button } from "@/components/ui/button";
import { Play, Users, Square, VolumeX, PlusCircle, LinkIcon, AlertTriangle, Bell, BatteryCharging, Signal, CheckCircle } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const [childName, setChildName] = useState<string>('Child');
  const [parentName, setParentName] = useState<string>('Not Linked');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sharing, setSharing] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const childId = localStorage.getItem('child_id');
    const name = localStorage.getItem('child_name');
    if (name) setChildName(name);

    if (childId) {
      fetch(`http://localhost:8000/family/child/dashboard?child_id=${childId}`)
        .then(res => res.json())
        .then(data => {
          if (data.child?.name) setChildName(data.child.name);
          if (data.parent_name) setParentName(data.parent_name);
          // Restore last known location from DB
          if (data.child?.lat && data.child?.lon) {
            setLocation({ lat: data.child.lat, lon: data.child.lon });
          }
        })
        .catch(console.error);
    }
  }, []);

  // Post location to backend
  const postLocation = (lat: number, lon: number) => {
    const childId = localStorage.getItem('child_id');
    if (!childId) return;
    fetch(`http://localhost:8000/family/child/location?child_id=${childId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lon }),
    }).catch(console.error);
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setSharing(true);
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(newLoc);
        postLocation(newLoc.lat, newLoc.lon);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    watchIdRef.current = id;
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-6 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 font-medium text-white">
        <div className="flex items-center gap-4">
          <h1 className="hidden md:block font-black text-white text-lg">Live Dashboard</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-zinc-500">
            <Bell className="w-5 h-5" />
            <BatteryCharging className="w-5 h-5" />
            <Signal className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold">
            {childName[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="w-full h-[calc(100vh-3.5rem-5rem)] flex overflow-hidden">
        {/* LEFT CONTROL COLUMN */}
        <section className="w-80 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-6 overflow-y-auto z-10">
          <div>
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1 block">Current Status</span>
            <h2 className="text-2xl font-bold text-white">Welcome, {childName}</h2>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="w-full justify-between h-14 rounded-xl font-bold">
              <span>Create Trip</span>
              <PlusCircle className="w-5 h-5" />
            </Button>

            {!sharing ? (
              <Button
                variant="outline"
                onClick={startSharing}
                className="w-full justify-between h-14 border-emerald-800 text-emerald-400 rounded-xl hover:bg-emerald-900/30 transition-colors"
              >
                <span>Start Sharing Location</span>
                <Play className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={stopSharing}
                className="w-full justify-between h-14 border-red-800 text-red-400 rounded-xl hover:bg-red-900/30 transition-colors"
              >
                <span>Stop Sharing Location</span>
                <Square className="w-5 h-5" />
              </Button>
            )}

            <Button variant="outline" className="w-full justify-between h-14 border-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors">
              <span>Share via Link</span>
              <LinkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Location Status */}
          {location && (
            <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-900/30 text-xs text-zinc-400 space-y-1">
              <p className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Last Known Location</p>
              <p>Lat: {location.lat.toFixed(5)}</p>
              <p>Lon: {location.lon.toFixed(5)}</p>
            </div>
          )}

          {/* Parent Info Card */}
          <div className="mt-auto border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest block mb-3">Linked Guardian</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{parentName}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${parentName !== 'Not Linked' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                  <p className="text-zinc-500 text-[11px]">
                    {parentName !== 'Not Linked' ? 'Connected' : 'Not linked yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT MAP COLUMN */}
        <section className="flex-1 relative bg-zinc-900 overflow-hidden">
          <div className="absolute inset-0">
            <MapView interactive={true} centerPoint={location} />
          </div>

          {/* Sharing status badge */}
          <div className="absolute top-4 left-4 z-20">
            {sharing && (
              <div className="bg-zinc-950/90 backdrop-blur border border-emerald-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sharing Live</span>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 right-0 left-0 z-50 flex justify-center gap-4 items-center h-20 px-8 bg-zinc-950 border-t border-zinc-800">
        <div className="flex-1 flex gap-4">
          <div className="border border-zinc-800 rounded-md px-6 py-2 flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Location Sharing</span>
            <span className={`text-xs font-bold ${sharing ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {sharing ? 'Active' : 'Off'}
            </span>
          </div>
          <div className="border border-zinc-800 rounded-md px-6 py-2 flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Linked To</span>
            <span className="text-white text-xs font-bold">{parentName}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-10 border-zinc-800 text-zinc-400 hover:border-white hover:text-white transition-all gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Safe Check-in</span>
          </Button>
          <Button variant="outline" className="h-10 border-zinc-800 text-zinc-400 hover:border-white hover:text-white transition-all gap-2">
            <VolumeX className="w-5 h-5" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Silent Alert</span>
          </Button>
          <Button variant="secondary" className="h-10 bg-white text-black hover:bg-zinc-200 transition-all gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-[11px] font-bold uppercase text-red-500 tracking-widest">Emergency SOS</span>
          </Button>
        </div>
      </footer>
    </>
  );
}
