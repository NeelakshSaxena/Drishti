import Link from 'next/link';

export default function Page() {
  return (
    <>

{/*  TopNavBar Execution  */}
<header className="bg-zinc-950 text-white font-inter antialiased tracking-tighter flex items-center justify-between px-6 h-16 w-full docked border-b border-zinc-800 z-50">
<div className="text-xl font-bold tracking-widest text-white">DRISHTI</div>
<div className="hidden md:flex items-center gap-8">
<nav className="flex gap-6">
<a className="text-white font-bold transition-colors" href="#">Monitoring</a>
<a className="text-zinc-500 hover:text-white transition-colors" href="#">Archive</a>
<a className="text-zinc-500 hover:text-white transition-colors" href="#">Diagnostics</a>
</nav>
<div className="h-8 w-[1px] bg-zinc-800"></div>
<div className="flex items-center gap-3">
<div className="text-right">
<p className="text-[10px] font-label-caps text-zinc-500 uppercase">Observer</p>
<p className="text-body-sm font-medium">Terminal V1.0</p>
</div>
<div className="w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center">
<span className="material-symbols-outlined text-zinc-400 text-sm">visibility</span>
</div>
</div>
</div>
</header>
<main className="flex-1 flex overflow-hidden">
{/*  SideNavBar Execution / Left Column  */}
<aside className="bg-zinc-950 text-white font-inter text-xs font-medium uppercase tracking-widest flex flex-col py-8 gap-8 h-full w-80 border-r border-zinc-800 transition-all duration-150">
<div className="px-8 space-y-6">
{/*  Selection Section  */}
<div className="space-y-4">
<div className="flex items-center gap-2 text-white border-l-2 border-white pl-4">
<span className="material-symbols-outlined text-lg" data-icon="child_care">child_care</span>
<span>Selection</span>
</div>
<div className="pl-4 space-y-2">
<label className="text-[10px] text-zinc-500 font-label-caps tracking-[0.1em]">Target Subject</label>
<div className="relative group opacity-50 cursor-not-allowed">
<div className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-between px-4">
<span className="text-zinc-400 normal-case tracking-normal text-sm">Aarav Sharma</span>
<span className="material-symbols-outlined text-zinc-600">lock</span>
</div>
</div>
<p className="text-[9px] text-zinc-600 lowercase tracking-normal px-1">Selection locked during active monitoring</p>
</div>
</div>
{/*  Trip Status Section  */}
<div className="space-y-4">
<div className="flex items-center gap-2 text-zinc-600 pl-4">
<span className="material-symbols-outlined text-lg" data-icon="distance">distance</span>
<span>Trip Status</span>
</div>
<div className="pl-4 space-y-4">
{/*  Read-only Status Cards  */}
<div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-4">
<div className="space-y-1">
<span className="text-[10px] text-zinc-500 font-label-caps">Current Mode</span>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-white/5 border border-zinc-700 flex items-center justify-center">
<span className="material-symbols-outlined text-white text-base">directions_bus</span>
</div>
<div>
<p className="text-sm text-white normal-case tracking-normal font-semibold">Transit: Line 402</p>
<p className="text-[10px] text-zinc-500 normal-case tracking-normal">Heading North-East</p>
</div>
</div>
</div>
<div className="h-[1px] bg-zinc-800 w-full"></div>
<div className="space-y-1">
<span className="text-[10px] text-zinc-500 font-label-caps">Upcoming Mode</span>
<div className="flex items-center gap-3">
<div className="w-8 h-8 rounded-lg bg-white/5 border border-zinc-700 flex items-center justify-center">
<span className="material-symbols-outlined text-zinc-400 text-base">directions_walk</span>
</div>
<div>
<p className="text-sm text-zinc-300 normal-case tracking-normal">Walking: 0.4 miles</p>
<p className="text-[10px] text-zinc-500 normal-case tracking-normal">ETA: 6 minutes</p>
</div>
</div>
</div>
</div>
{/*  Telemetry Meta  */}
<div className="grid grid-cols-2 gap-2">
<div className="border border-zinc-800 p-3 rounded-lg bg-zinc-900/20">
<span className="block text-[9px] text-zinc-500 font-label-caps mb-1">Velocity</span>
<span className="text-white text-xs font-bold tabular-nums">24 KM/H</span>
</div>
<div className="border border-zinc-800 p-3 rounded-lg bg-zinc-900/20">
<span className="block text-[9px] text-zinc-500 font-label-caps mb-1">Battery</span>
<span className="text-white text-xs font-bold tabular-nums">88%</span>
</div>
</div>
</div>
</div>
</div>
{/*  Footer Meta for Sidebar  */}
<div className="mt-auto px-8">
<div className="border-t border-zinc-800 pt-6 space-y-1">
<p className="text-[10px] text-zinc-600 normal-case font-label-caps">System Instance</p>
<p className="text-[10px] text-zinc-400 normal-case tabular-nums">ID: 882-X90-TRK</p>
</div>
</div>
</aside>
{/*  Right Column: Map Container  */}
<section className="flex-1 relative bg-zinc-900 overflow-hidden">
{/*  Map Simulation Overlay  */}
<div className="absolute inset-0 map-mesh opacity-20"></div>
{/*  Map Visualization  */}
<div className="absolute inset-0 flex items-center justify-center">
<div className="w-full h-full relative">
<img className="w-full h-full object-cover grayscale brightness-50 contrast-125" data-alt="A sophisticated dark-themed digital map interface showing a complex city grid in deep grays and blacks. A glowing cyan line represents the active route path, cutting through the urban geometry. Minimalist white markers pinpoint the current location and destination, while subtle grid textures and glowing node points emphasize a high-tech monitoring environment. The lighting is low-key with high-contrast UI elements, creating a focused and utilitarian surveillance aesthetic." data-location="San Francisco" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL1tNAtVTti4RoxAELJV4iL6lOLwJznx-H7tpk9S1WG8wNnCgJAFPstpYyZyoVGjxU6mryO1XAf1F008qADAfz-ciWPdkzkjNGDQhO1NcaRhBlHVl6ygrbeyXMU2hgKiM1tSZUFHpchJodrrnGsUMxaxrMRT00ND44LL2HOy0RlnPac1PZJiXji_RM-vwONaHASxixSMfXek_Lh3HrjRUI_9ZKCAvFgj9V4WMz1UGigIhvilkn-eJ_6xVxUrVYB5bcLPTwWfabGrs"/>
{/*  Subject Pulse Marker (Fixed in center for visual)  */}
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
<div className="relative">
<div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150"></div>
<div className="w-4 h-4 bg-white rounded-full border-2 border-zinc-950 relative z-10"></div>
<div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
<span className="text-[10px] font-bold text-white tracking-widest uppercase">Subject Alpha</span>
</div>
</div>
</div>
</div>
</div>
{/*  HUD Overlays  */}
<div className="absolute top-8 right-8 flex flex-col gap-3">
<div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
<div className="w-2 h-2 rounded-full bg-white"></div>
<div>
<p className="text-[10px] font-label-caps text-zinc-500 uppercase">Live Feed</p>
<p className="text-sm font-bold text-white">ACTIVE CONNECTION</p>
</div>
</div>
<div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-4 rounded-xl space-y-2">
<p className="text-[10px] font-label-caps text-zinc-500 uppercase">Coordinates</p>
<p className="text-xs font-mono text-zinc-300">37.7749° N, 122.4194° W</p>
</div>
</div>
</section>
</main>
{/*  BottomNavBar Execution  */}
<footer className="bg-zinc-950 text-white font-inter text-[10px] font-bold tracking-widest fixed bottom-0 left-0 w-full h-12 flex justify-start items-center px-8 gap-12 z-50 border-t border-zinc-800">
{/*  Status Indicators  */}
<div className="text-white flex flex-row items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="location_searching">location_searching</span>
<span>GPS: ACTIVE</span>
</div>
<div className="text-white flex flex-row items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="verified_user">verified_user</span>
<span>NET: SECURE</span>
</div>
<div className="text-zinc-500 flex flex-row items-center gap-2">
<span className="material-symbols-outlined text-sm" data-icon="memory">memory</span>
<span>SYS: READY</span>
</div>
<div className="h-4 w-[1px] bg-zinc-800"></div>
{/*  Dynamic Contextual Status  */}
<div className="flex items-center gap-8 text-zinc-400">
<div className="flex items-center gap-2">
<span className="text-[9px] text-zinc-600">LAST PING:</span>
<span className="text-zinc-300">2 MINUTES AGO</span>
</div>
<div className="flex items-center gap-2">
<span className="text-[9px] text-zinc-600">TRIP MODE:</span>
<span className="text-zinc-300">TRANSIT</span>
</div>
</div>
{/*  Central Badge (Action Prohibition)  */}
<div className="absolute left-1/2 -translate-x-1/2">
<div className="bg-zinc-800 px-4 py-1 rounded-full border border-zinc-700">
<span className="text-[9px] tracking-[0.2em] text-white">STATUS: VIEW ONLY</span>
</div>
</div>
{/*  Right Aligned Meta  */}
<div className="ml-auto flex items-center gap-2 text-zinc-600">
<span className="text-[9px]">ENCRYPTED STREAM</span>
<span className="material-symbols-outlined text-sm">lock</span>
</div>
</footer>

    </>
  );
}
