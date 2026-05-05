import Link from 'next/link';

export default function Page() {
  return (
    <>

{/*  Sidebar / Navigation Shell  */}
<aside className="fixed left-0 top-0 flex flex-col h-full h-screen w-64 border-r border-zinc-800 bg-zinc-950 font-inter text-sm antialiased">
<div className="p-lg flex flex-col gap-lg">
{/*  Brand & Parent Greeting  */}
<div>
<h2 className="text-white font-bold tracking-tight text-lg mb-base">Parent Portal</h2>
<p className="text-zinc-400 text-xs">Managing 2 children</p>
</div>
<div className="space-y-sm">
<h1 className="font-h1 text-h3 text-white">Welcome, Sarah</h1>
{/*  Custom Shadcn-style Dropdown  */}
<div className="relative group">
<button className="w-full flex items-center justify-between px-md py-sm rounded-lg border-technical bg-transparent text-on-surface-variant hover:border-white transition-colors duration-150">
<span className="font-label-caps text-label-caps">Select Child</span>
<span className="material-symbols-outlined text-xs">expand_more</span>
</button>
{/*  Mock Dropdown Menu  */}
<div className="hidden group-hover:block absolute top-full left-0 w-full mt-xs bg-surface-container border-technical rounded-lg overflow-hidden z-10">
<div className="px-md py-sm bg-zinc-900 text-white cursor-pointer transition-colors duration-150">Leo Thompson</div>
<div className="px-md py-sm hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors duration-150">Mia Thompson</div>
</div>
</div>
</div>
{/*  Standard Nav Items  */}
<nav className="flex flex-col gap-xs mt-md">
<a className="bg-zinc-900 text-white font-medium flex items-center gap-sm px-md py-sm rounded-lg opacity-90 active:opacity-100 transition-colors duration-150" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span>Dashboard</span>
</a>
<a className="text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center gap-sm px-md py-sm rounded-lg opacity-90 active:opacity-100 transition-colors duration-150" href="#">
<span className="material-symbols-outlined" data-icon="route">route</span>
<span>Trip History</span>
</a>
<a className="text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center gap-sm px-md py-sm rounded-lg opacity-90 active:opacity-100 transition-colors duration-150" href="#">
<span className="material-symbols-outlined" data-icon="family_restroom">family_restroom</span>
<span>Family Management</span>
</a>
<a className="text-zinc-400 hover:text-white hover:bg-zinc-900 flex items-center gap-sm px-md py-sm rounded-lg opacity-90 active:opacity-100 transition-colors duration-150" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span>Settings</span>
</a>
</nav>
<button className="w-full bg-white text-black font-bold py-sm rounded-lg hover:opacity-90 transition-opacity mt-auto">
                Add Child
            </button>
</div>
{/*  Footer Navigation  */}
<div className="mt-auto p-lg border-t border-zinc-800">
<nav className="flex flex-col gap-xs">
<a className="text-zinc-400 hover:text-white flex items-center gap-sm px-md py-sm" href="#">
<span className="material-symbols-outlined" data-icon="help">help</span>
<span>Support</span>
</a>
<a className="text-zinc-400 hover:text-white flex items-center gap-sm px-md py-sm" href="#">
<span className="material-symbols-outlined" data-icon="logout">logout</span>
<span>Sign Out</span>
</a>
</nav>
</div>
</aside>
{/*  Main Content Area  */}
<main className="ml-64 flex flex-col h-screen overflow-hidden">
{/*  Two Column Grid Container  */}
<div className="flex-1 grid grid-cols-12 overflow-hidden">
{/*  Left Column: Trip Status  */}
<div className="col-span-3 border-r border-zinc-800 p-lg bg-background overflow-y-auto">
<div className="flex flex-col gap-lg">
<div>
<h3 className="text-h3 font-h3 text-white mb-md">Trip Status</h3>
{/*  Mode Sections  */}
<div className="space-y-md">
{/*  Current Mode  */}
<div className="p-md rounded-xl border-technical bg-surface-container-lowest">
<span className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">CURRENT MODE</span>
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-primary" data-icon="directions_bus">directions_bus</span>
<span className="text-body-lg font-body-lg text-white">Transit: Line 402</span>
</div>
<p className="text-body-sm text-zinc-500 mt-xs">Departed 12 min ago</p>
</div>
{/*  Upcoming Mode  */}
<div className="p-md rounded-xl border-technical bg-surface-container-lowest">
<span className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">UPCOMING MODE</span>
<div className="flex items-center gap-sm">
<span className="material-symbols-outlined text-zinc-400" data-icon="directions_walk">directions_walk</span>
<span className="text-body-lg font-body-lg text-white">Walking: 0.4 miles</span>
</div>
<p className="text-body-sm text-zinc-500 mt-xs">Estimated start: 3:45 PM</p>
</div>
{/*  Tickets / Receipts  */}
<div className="p-md rounded-xl border-technical bg-surface-container-lowest">
<span className="font-label-caps text-label-caps text-on-surface-variant block mb-xs">TICKETS / RECEIPTS</span>
<div className="flex flex-col gap-sm">
<div className="flex justify-between items-center py-xs border-b border-zinc-800">
<span className="text-white text-sm">Monthly Pass #412</span>
<span className="material-symbols-outlined text-zinc-400" data-icon="qr_code_2">qr_code_2</span>
</div>
<div className="flex justify-between items-center py-xs">
<span className="text-white text-sm">Transfer Receipt</span>
<span className="material-symbols-outlined text-zinc-400" data-icon="description">description</span>
</div>
</div>
</div>
</div>
</div>
{/*  Additional Context Card  */}
<div className="p-md rounded-xl border-technical bg-surface-container-low">
<div className="flex items-center justify-between mb-sm">
<span className="font-h3 text-white text-sm font-semibold">Active Alerts</span>
<span className="w-2 h-2 bg-error rounded-full"></span>
</div>
<p className="text-body-sm text-on-surface-variant">Arrival delay reported on Line 402 due to heavy traffic on 5th Ave.</p>
</div>
</div>
</div>
{/*  Right Column: Map Content  */}
<div className="col-span-9 relative bg-zinc-900">
<div className="absolute inset-0 z-0">
<img className="w-full h-full object-cover opacity-60 grayscale brightness-50" data-alt="A highly detailed dark mode interface map showing a metropolitan area with intricate street lines and minimalist UI pins. The aesthetics are strictly monochromatic with deep charcoal blacks and subtle gray highlights. Precise geometric vector lines indicate transit routes and location pings, creating a professional and high-tech command center atmosphere with soft, focused ambient lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDG-yGPacgpUjChGNCQe7_x8ilJ6EkhH4rRj8-qfWQALpURKff7fRJwcX2sBjiS78wWdxbbk3MmbhQNcLZHchzaqNoZHkP9b6iHtbEC6dvoqYoEAbk7re2_BYh2jviZtO5Ww05fuwd7XH4XuQeqCAx8N7Rr4g2E_sFkUw9JOspuMlWPlWbTfKogkTkN2VlMAeFKX9z7JB8P3qa4TfDFAgfPyt6yjZRhCTm2Ld_LLjWg9QQ6IZ8boZIekFckTOeGZ0qYYrAsXoN3Qs"/>
</div>
{/*  Map Overlay Elements  */}
<div className="absolute top-lg right-lg z-10 flex flex-col gap-sm">
<div className="bg-zinc-950 border-technical rounded-lg p-sm flex items-center gap-sm">
<div className="w-3 h-3 bg-white rounded-full"></div>
<span className="text-white text-xs font-medium">LEO'S LIVE LOCATION</span>
</div>
<div className="bg-zinc-950 border-technical rounded-lg p-sm">
<span className="material-symbols-outlined text-white" data-icon="my_location">my_location</span>
</div>
<div className="bg-zinc-950 border-technical rounded-lg p-sm">
<span className="material-symbols-outlined text-white" data-icon="layers">layers</span>
</div>
</div>
{/*  Live Signal Graphic (Decorative)  */}
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
<div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
<div className="w-3 h-3 bg-white rounded-full"></div>
</div>
<div className="absolute w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>
</div>
</div>
</div>
{/*  Action Hub / Bottom Navigation  */}
<footer className="fixed bottom-0 right-0 left-64 z-50 flex justify-center gap-12 py-4 px-8 bg-zinc-950 border-t border-zinc-800">
<button className="flex flex-col items-center gap-xs text-white group">
<span className="material-symbols-outlined transition-transform duration-75 group-active:scale-95" data-icon="location_searching">location_searching</span>
<span className="font-inter text-[10px] uppercase tracking-widest font-semibold">Ping Location</span>
</button>
<button className="flex flex-col items-center gap-xs text-zinc-500 hover:text-white group">
<span className="material-symbols-outlined transition-transform duration-75 group-active:scale-95" data-icon="commute">commute</span>
<span className="font-inter text-[10px] uppercase tracking-widest font-semibold">Trip Mode</span>
</button>
<button className="flex flex-col items-center gap-xs text-zinc-500 hover:text-white group">
<span className="material-symbols-outlined transition-transform duration-75 group-active:scale-95" data-icon="notifications_active">notifications_active</span>
<span className="font-inter text-[10px] uppercase tracking-widest font-semibold">Alerts</span>
</button>
</footer>
</main>

    </>
  );
}
