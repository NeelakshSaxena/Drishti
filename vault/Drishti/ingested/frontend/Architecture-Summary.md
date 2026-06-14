# Frontend Architecture Summary (Ingested)

## Tech Stack
- **Framework**: Next.js 14 (App Router, RSC), React 18, TypeScript
- **UI System**: shadcn/ui (new-york style) + Radix UI + Tailwind CSS 3.4
- **Icons**: Lucide React | **Font**: Inter (Google Fonts)
- **Maps**: MapLibre GL | **Forms**: react-hook-form + zod
- **Backend**: FastAPI (Python) on Render | **DB**: Supabase PostgreSQL

## Auth Model
- **Type**: Session-ID based (no JWT/tokens for family routes)
- **Storage**: `localStorage` (persistent) or `sessionStorage` (per-tab)
- **Validation**: On-mount API call to dashboard endpoint → confirm entity exists
- **No**: refresh tokens, JWT, Bearer headers, cookies, CSRF

## Key Storage Keys
```
parent_id, parent_name, child_id, child_code, child_name, drishti.backendUrl
```

## API Base URL
- Production: `https://drishti-walb.onrender.com`
- Local: `http://127.0.0.1:8000`
- Override: `NEXT_PUBLIC_API_BASE_URL` env var or localStorage `drishti.backendUrl`

## State Management
- **No global state library** (no Redux, Zustand, Jotai)
- Local `useState` + `useEffect` per page
- Polling via `setInterval` (2-15s intervals)
- Custom hooks: `useDebounce`, `useAbortController`, `useAsync`

## Design Language
- **Theme**: Dark-first, zinc palette, glassmorphism cards
- **Background**: `#09090B` (zinc-950)
- **Cards**: Semi-transparent (`bg-zinc-950/60 backdrop-blur-md`)
- **Buttons**: Primary = white/black inverted; Outline = zinc border
- **Labels**: 10px uppercase tracking-widest
- **Status**: Emerald (live), Amber (warning), Red (error)
- **Radius**: 0.5rem default, `rounded-xl` for cards

## Persistence
- `localStorage` for "Remember Me" sessions
- `sessionStorage` for temporary sessions
- `navigator.geolocation` for live location
- No offline storage, no service workers, no IndexedDB

## WebSocket
- Only for device/node gateway (`/ws/device?token=xxx`)
- Family tracking frontend uses HTTP polling exclusively
- No WebSocket in any family-facing page
