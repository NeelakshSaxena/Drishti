import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Minus, Footprints, MapPin, Plus, Users, Search, Phone, Receipt, Locate, ChevronDown, BatteryCharging, Mic, ExternalLink, Bell, StopCircle, RefreshCw, HelpCircle, Clock, Bus, Settings, Route } from 'lucide-react';

export default function Page() {
  return (
    <>

{/*  Top App Bar  */}
<header className="flex items-center justify-between w-full px-6 h-14 border-b border-zinc-800 bg-neutral-950/80 backdrop-blur-md z-40">
<div className="flex items-center gap-4">
<span className="font-inter text-xs font-medium uppercase tracking-widest text-white">Trip Monitor</span>
<div className="h-4 w-[1px] bg-zinc-800"></div>
<div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1 gap-2">
<Search className="w-5 h-5" />
<input className="bg-transparent border-none text-[10px] text-white focus:ring-0 w-32 placeholder-zinc-600 uppercase tracking-tighter" placeholder="Search coordinates..." type="text"/>
</div>
</div>
<div className="flex items-center gap-4">
<Button variant="secondary" className="h-7 text-[10px] font-bold px-4 rounded-md uppercase tracking-widest">
                Emergency
            </Button>
<Settings className="w-5 h-5 text-white" />
<HelpCircle className="w-5 h-5 text-white" />
</div>
</header>
{/*  Main Content Canvas  */}
<main className="w-full h-[calc(100vh-3.5rem-4rem)] flex overflow-hidden">
{/*  LEFT COLUMN: Control Panel  */}
<section className="w-80 border-r border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
<div>
<h2 className="font-h2 text-white mb-1">Welcome, Sarah</h2>
<p className="text-body-sm text-zinc-500">Monitor active movements in real-time.</p>
</div>
{/*  Dropdown: Select Child  */}
<div className="space-y-2">
<label className="font-label-caps text-zinc-500 uppercase">Active Monitoring</label>
<div className="relative">
<Button variant="outline" className="w-full justify-between bg-zinc-900 border-zinc-800 h-12 rounded-lg text-sm text-white hover:bg-zinc-800 hover:text-white transition-colors">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span>
<span>Leo Miller</span>
</div>
<ChevronDown className="w-5 h-5" />
</Button>
</div>
</div>
{/*  Card: Trip Status  */}
<div className="bg-transparent border border-zinc-800 rounded-xl p-5 space-y-6">
<div className="flex items-center justify-between border-b border-zinc-800 pb-3">
<h3 className="font-label-caps text-white uppercase tracking-widest">Trip Status</h3>
<span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded font-bold">ACTIVE</span>
</div>
<div className="space-y-4">
<div className="flex items-start gap-3">
<div className="mt-1 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
<Bus className="w-5 h-5" />
</div>
<div>
<p className="font-label-caps text-zinc-500 uppercase">Current Mode</p>
<p className="text-body-sm text-white font-medium">Transit: Line 402</p>
</div>
</div>
<div className="flex items-start gap-3">
<div className="mt-1 w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
<Footprints className="w-5 h-5" />
</div>
<div>
<p className="font-label-caps text-zinc-500 uppercase">Upcoming Mode</p>
<p className="text-body-sm text-white font-medium">Walking: 0.4 miles</p>
</div>
</div>
</div>
<div className="pt-4 border-t border-zinc-800">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<Receipt className="w-5 h-5" />
<span className="text-[10px] font-bold text-zinc-300 uppercase tracking-tighter">Monthly Pass #412</span>
</div>
<ExternalLink className="w-5 h-5" />
</div>
</div>
</div>
{/*  Status Metrics  */}
<div className="grid grid-cols-2 gap-3">
<div className="bg-zinc-900/30 border border-zinc-800 p-3 rounded-lg">
<p className="font-label-caps text-zinc-500 text-[10px] uppercase mb-1">Battery</p>
<div className="flex items-center gap-1">
<BatteryCharging className="w-5 h-5" />
<span className="text-body-sm font-bold text-white">84%</span>
</div>
</div>
<div className="bg-zinc-900/30 border border-zinc-800 p-3 rounded-lg">
<p className="font-label-caps text-zinc-500 text-[10px] uppercase mb-1">ETA Home</p>
<div className="flex items-center gap-1">
<Clock className="w-5 h-5" />
<span className="text-body-sm font-bold text-white">14 min</span>
</div>
</div>
</div>
</section>
{/*  RIGHT COLUMN: Main Map View  */}
<section className="flex-1 relative bg-zinc-900">
<div className="absolute inset-0 w-full h-full grayscale opacity-50 contrast-125">
<img className="w-full h-full object-cover" data-alt="A highly detailed aerial satellite view of a modern urban street grid at night. The city layout is defined by sharp geometric blocks and glowing arterial roads in a monochromatic palette of deep blacks and silvers. Thin, luminous cyan lines trace public transit paths, creating a technical and utilitarian interface look. The atmosphere is precise, sophisticated, and data-driven." data-location="New York City" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF7-p6NCXqr9ClGoV5U2g79AYOVH4iw5UID-orCKOK3aBfZsoRQaPiImt3Qki82ShwPtRoEF5uc1F6m7GcupltymZn452uVAbQLGuLh3qQCmdUQK9aMLmLh-d6rPfVUIOO4S_la-nzNu8-j1ArdU-COYzc9GhVC-RMt-uFyQqJLHVTGhlPqCHBv69u9-FoOkC5br-XIQWuQpbit2GMC3YGD6KsMc3LpRU8GzQSk54GRlp4mYt1SglSwGv9vCkMweyskCDyBsfJdM8"/>
</div>
{/*  Map Overlay UI  */}
<div className="absolute top-6 left-6 flex flex-col gap-2">
<div className="bg-neutral-950 border border-zinc-800 p-3 rounded-lg flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
<span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Tracking Active</span>
</div>
</div>
{/*  Floating Map Controls  */}
<div className="absolute right-6 top-6 flex flex-col gap-2">
<Button variant="outline" size="icon" className="bg-neutral-950 border-zinc-800 w-10 h-10 text-white hover:bg-zinc-900 hover:text-white">
<Plus className="w-5 h-5" />
</Button>
<Button variant="outline" size="icon" className="bg-neutral-950 border-zinc-800 w-10 h-10 text-white hover:bg-zinc-900 hover:text-white">
<Minus className="w-5 h-5" />
</Button>
<Button variant="outline" size="icon" className="bg-neutral-950 border-zinc-800 w-10 h-10 text-white hover:bg-zinc-900 hover:text-white mt-4">
<Locate className="w-5 h-5" />
</Button>
</div>
</section>
</main>
{/*  Bottom Action Bar Shell  */}
<footer className="fixed bottom-0 right-0 left-0 border-t border-zinc-800 bg-neutral-950 h-16 flex items-center justify-around px-24 z-50">
<Button variant="ghost" className="flex flex-col items-center gap-1 group h-auto py-2">
<div className="text-zinc-500 group-hover:text-white transition-all p-1">
<StopCircle className="w-5 h-5" />
</div>
<span className="font-inter text-[10px] font-bold uppercase tracking-tighter text-zinc-500 group-hover:text-white">Freeze Trip</span>
</Button>
<Button variant="secondary" className="flex flex-col items-center gap-1 group h-auto py-2 px-6 bg-zinc-800 hover:bg-zinc-700">
<div className="text-white transition-all">
<Phone className="w-5 h-5" />
</div>
<span className="font-inter text-[10px] font-bold uppercase tracking-tighter text-white">Voice Call</span>
</Button>
<Button variant="ghost" className="flex flex-col items-center gap-1 group h-auto py-2">
<div className="text-zinc-500 group-hover:text-white transition-all p-1">
<Mic className="w-5 h-5" />
</div>
<span className="font-inter text-[10px] font-bold uppercase tracking-tighter text-zinc-500 group-hover:text-white">Broadcast</span>
</Button>
<Button variant="ghost" className="flex flex-col items-center gap-1 group h-auto py-2">
<div className="text-zinc-500 group-hover:text-white transition-all p-1">
<RefreshCw className="w-5 h-5" />
</div>
<span className="font-inter text-[10px] font-bold uppercase tracking-tighter text-zinc-500 group-hover:text-white">Refresh</span>
</Button>
</footer>

    </>
  );
}
