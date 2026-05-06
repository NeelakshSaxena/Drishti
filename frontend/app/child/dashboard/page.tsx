"use client";

import { Button } from "@/components/ui/button";
import {
  Play, Users, Square, VolumeX, PlusCircle, LinkIcon,
  AlertTriangle, Bell, BatteryCharging, Signal,
  CheckCircle, Copy, X, Menu
} from 'lucide-react';
import { MapView } from '@/components/MapView';
import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://drishti-walb.onrender.com';

export default function Page() {
  const [childName, setChildName] = useState<string>('Child');
  const [parentName, setParentName] = useState<string>('Not Linked');
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareExpiry, setShareExpiry] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const childId = localStorage.getItem('child_id');
    const name = localStorage.getItem('child_name');
    if (name) setChildName(name);

    if (childId) {
      fetch(`${API_URL}/family/child/dashboard?child_id=${childId}`)
        .then(res => res.json())
        .then(data => {
          if (data.child?.name) setChildName(data.child.name);
          if (data.parent_name) setParentName(data.parent_name);
          if (data.child?.lat && data.child?.lon) {
            setLocation({ lat: data.child.lat, lon: data.child.lon });
          }
        })
        .catch(console.error);
    }
  }, []);

  const postLocation = (lat: number, lon: number) => {
    const childId = localStorage.getItem('child_id');
    if (!childId) return;
    fetch(`${API_URL}/family/child/location?child_id=${childId}`, {
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
    // Tell backend the child stopped sharing
    const childId = localStorage.getItem('child_id');
    if (childId) {
      fetch(`${API_URL}/family/child/stop-sharing?child_id=${childId}`, {
        method: 'POST',
      }).catch(console.error);
    }
  };

  const handleShareLink = async () => {
    const childId = localStorage.getItem('child_id');
    if (!childId) return;
    try {
      const res = await fetch(`${API_URL}/family/child/share-link?child_id=${childId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        const fullUrl = `${window.location.origin}${data.url}`;
        setShareLink(fullUrl);
        setShareExpiry(data.expires_at
          ? new Date(data.expires_at + 'Z').toLocaleString()
          : null);
        setShowShareModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        setCopyDone(true);
        setTimeout(() => setCopyDone(false), 2000);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top App Bar ─────────────────────────────────────── */}
      <header className="flex justify-between items-center w-full px-4 sm:px-6 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 font-medium text-white shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-black text-white text-lg tracking-widest uppercase">Drishti</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden sm:flex items-center gap-4 text-zinc-500">
            <Bell className="w-5 h-5" />
            <BatteryCharging className="w-5 h-5" />
            <Signal className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold">
            {childName[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* LEFT CONTROL COLUMN */}
        <section className={`
          fixed lg:relative inset-y-0 left-0 z-30
          w-[280px] sm:w-80 border-r border-zinc-800 bg-zinc-950 p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-14 lg:top-0
        `}>

          {/* Greeting first, label below */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome, {childName}</h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">Current Status</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="w-full justify-between h-12 sm:h-14 rounded-xl font-bold">
              <span>Create Trip</span>
              <PlusCircle className="w-5 h-5" />
            </Button>

            {!sharing ? (
              <Button
                variant="outline"
                onClick={startSharing}
                className="w-full justify-between h-12 sm:h-14 border-emerald-800 text-emerald-400 rounded-xl hover:bg-emerald-900/30 transition-colors"
              >
                <span>Start Sharing Location</span>
                <Play className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={stopSharing}
                className="w-full justify-between h-12 sm:h-14 border-red-800 text-red-400 rounded-xl hover:bg-red-900/30 transition-colors"
              >
                <span>Stop Sharing Location</span>
                <Square className="w-5 h-5" />
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleShareLink}
              className="w-full justify-between h-12 sm:h-14 border-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors"
            >
              <span>Share via Link</span>
              <LinkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* Last known location */}
          {location && (
            <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-900/30 text-xs text-zinc-400 space-y-1">
              <p className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Last Known Location</p>
              <p>Lat: {location.lat.toFixed(5)}</p>
              <p>Lon: {location.lon.toFixed(5)}</p>
            </div>
          )}

          {/* Parent / guardian card */}
          <div className="mt-auto border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
            <span className="text-zinc-500 text-[10px] uppercase tracking-widest block mb-3">You are linked to</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{parentName}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${parentName !== 'Not Linked' ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
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

          {sharing && (
            <div className="absolute top-4 left-4 z-20">
              <div className="bg-zinc-950/90 backdrop-blur border border-emerald-800 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sharing Live</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ── Bottom Action Bar ─────────────────────────────── */}
      <footer className="shrink-0 z-50 flex flex-col sm:flex-row items-stretch sm:items-center h-auto sm:h-20 px-4 sm:px-8 py-3 sm:py-0 bg-zinc-950 border-t border-zinc-800 gap-3 sm:gap-4">
        <div className="flex-1 flex gap-3 sm:gap-4 overflow-x-auto">
          <div className="border border-zinc-800 rounded-md px-3 sm:px-5 py-2 flex flex-col items-start shrink-0">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Location</span>
            <span className={`text-xs font-bold ${sharing ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {sharing ? 'Active' : 'Off'}
            </span>
          </div>
          <div className="border border-zinc-800 rounded-md px-3 sm:px-5 py-2 flex flex-col items-start shrink-0">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Linked To</span>
            <span className="text-white text-xs font-bold">{parentName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" className="h-10 border-zinc-800 text-zinc-400 hover:border-white hover:text-white transition-all gap-2 flex-1 sm:flex-none">
            <CheckCircle className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">Check-in</span>
          </Button>
          <Button variant="outline" className="h-10 border-zinc-800 text-zinc-400 hover:border-white hover:text-white transition-all gap-2 flex-1 sm:flex-none">
            <VolumeX className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-widest hidden sm:inline">Silent</span>
          </Button>
          <Button className="h-10 bg-white text-black hover:bg-zinc-200 transition-all gap-2 flex-1 sm:flex-none">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">SOS</span>
          </Button>
        </div>
      </footer>

      {/* ── Share Link Modal ──────────────────────────────── */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Share Location Link</h3>
              <button onClick={() => setShowShareModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-zinc-400 text-sm mb-5">
              Anyone with this link can view your live location and trip status — <strong className="text-white">without logging in</strong>. They cannot control anything.
            </p>
            {shareExpiry && (
              <p className="text-zinc-500 text-[11px] mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Expires: {shareExpiry}
              </p>
            )}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-3 mb-4 flex items-center gap-3">
              <span className="text-zinc-300 text-xs font-mono flex-1 truncate">{shareLink}</span>
              <button
                onClick={copyLink}
                className="shrink-0 text-zinc-400 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copyDone && (
              <p className="text-emerald-400 text-xs text-center mb-3">✓ Copied to clipboard</p>
            )}
            <Button
              onClick={copyLink}
              className="w-full h-11 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200"
            >
              {copyDone ? '✓ Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
