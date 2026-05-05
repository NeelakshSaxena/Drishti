import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Play, Settings, Users, Square, VolumeX, History, Plus, PlusCircle, LinkIcon, AlertTriangle, Bell, Shield, BatteryCharging, Signal, CheckCircle, Minus, Map, Locate } from 'lucide-react';

export default function Page() {
  return (
    <>

      {/*  Top App Bar  */}
      <header className="flex justify-between items-center w-full px-6 h-14 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 font-inter font-medium text-white">
        <div className="flex items-center gap-4">
          <h1 className="hidden md:block font-black text-white text-lg">Live Dashboard</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-zinc-500">
            <Bell className="w-5 h-5" />
            <BatteryCharging className="w-5 h-5" />
            <Signal className="w-5 h-5" />
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
            <img alt="Child User" className="w-full h-full object-cover" data-alt="A portrait of a young person with a calm, neutral expression, positioned in a modern, low-lit environment with sharp focus. The lighting uses high-contrast shadows and cool tones to match a minimalist dark-mode user interface, emphasizing precision and clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUWaS3TuZ7LqTOyCAsujmFPHV_VRy13I00I9web5-t9qIXN8FEzDS5d7_6sojdLX2az4LwC_xRPKWXOwILJyM5kizUkJBCkpzpgYvi9StQz8o1-eDXdvzABVZays9IlwidUHIG9ERAI4ZtRaw20m_YRvSRNzMK4jBMt8EEVM8gBRiLjhc8wjiFOF7pNEU-L7JSVxFIwVc9KRqkqLLeVIYb9ZZbzRjWxkuPXscP-mUL8eLup4dCEkjrVzk8uvAP3o0-emCEaDUWhPA" />
          </div>
        </div>
      </header>
      {/*  Main Content Canvas  */}
      <main className="w-full h-[calc(100vh-3.5rem-5rem)] flex overflow-hidden">
        {/*  LEFT CONTROL COLUMN  */}
        <section className="w-80 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <span className="text-zinc-500 font-label-caps text-label-caps uppercase mb-2 block">Current Status</span>
            <h2 className="text-h2 font-h2 text-white">Welcome, Alex</h2>
          </div>
          {/*  Action Buttons  */}
          <div className="flex flex-col gap-2">
            <Button variant="secondary" className="w-full justify-between h-14 rounded-xl font-bold">
              <span>Create Trip</span>
              <PlusCircle className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="w-full justify-between h-14 border-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors">
              <span>Start Sharing Location</span>
              <Play className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="w-full justify-between h-14 border-zinc-800 text-zinc-500 rounded-xl hover:text-white hover:bg-zinc-900 transition-colors">
              <span>Stop Sharing Location</span>
              <Square className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="w-full justify-between h-14 border-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors">
              <span>Share via Link</span>
              <LinkIcon className="w-5 h-5" />
            </Button>
          </div>
          {/*  Parent Info Card  */}
          <div className="mt-auto border border-zinc-800 rounded-xl p-4 bg-zinc-900/30">
            <span className="text-zinc-500 font-label-caps text-[10px] uppercase tracking-widest block mb-3">Linked Guardian</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Sarah Jenkins</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <p className="text-zinc-500 text-[11px]">Online • Connected</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/*  RIGHT MAP COLUMN  */}
        <section className="flex-1 relative bg-zinc-900">
          {/*  Map Placeholder with data-location  */}
          <div className="absolute inset-0 bg-cover bg-center" data-alt="A high-contrast, dark-themed satellite map of a dense urban environment at night. The streets are outlined in muted grays and deep blacks, with subtle glowing lines indicating traffic or paths. The aesthetic is clean, utilitarian, and void of any vibrant colors except for a single pinpoint marker." data-location="San Francisco" >
          </div>
          {/*  Map Overlay Controls  */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="w-10 h-10 bg-zinc-950 border border-zinc-800 text-white hover:bg-zinc-900 transition-colors">
              <Plus className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="w-10 h-10 bg-zinc-950 border border-zinc-800 text-white hover:bg-zinc-900 transition-colors">
              <Minus className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" className="w-10 h-10 bg-zinc-950 border border-zinc-800 text-white hover:bg-zinc-900 transition-colors mt-4">
              <Locate className="w-5 h-5" />
            </Button>
          </div>
          {/*  Floating Status Badge  */}
          <div className="absolute top-6 left-6 bg-zinc-950/90 backdrop-blur border border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-zinc-950 bg-white"></div>
              <div className="w-6 h-6 rounded-full border-2 border-zinc-950 bg-zinc-700"></div>
            </div>
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Active Mesh: 2 Devices</span>
          </div>
        </section>
      </main>
      {/*  Bottom Action Bar  */}
      <footer className="fixed bottom-0 right-0 left-0 z-50 flex justify-center gap-4 items-center h-20 px-8 bg-zinc-950 border-t border-zinc-800">
        <div className="flex-1 flex gap-4">
          <div className="border border-zinc-800 rounded-md px-6 py-2 flex flex-col items-start transition-all duration-200">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Last Location Ping</span>
            <span className="text-white text-xs font-bold">2 minutes ago</span>
          </div>
          <div className="border border-zinc-800 rounded-md px-6 py-2 flex flex-col items-start transition-all duration-200">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Current Trip Mode</span>
            <span className="text-white text-xs font-bold">Walking to School</span>
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
