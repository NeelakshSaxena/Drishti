# Drishti UI Component Mapping & Design Language

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, RSC) |
| UI Library | shadcn/ui (new-york style) |
| CSS Framework | Tailwind CSS 3.4 |
| Icons | Lucide React |
| Typography | Inter (Google Fonts) |
| Maps | MapLibre GL |
| Forms | react-hook-form + zod |
| Toast | react-hot-toast |
| Component Style | Radix UI primitives + CVA |

## 2. Color System (Design Tokens)

### CSS Variables (HSL format, dark-first)
```
--background: 0 0% 4%       → #0a0a0a (near-black)
--foreground: 0 0% 98%      → #fafafa (white)
--card: 0 0% 4%              → #0a0a0a
--primary: 0 0% 98%          → white text/buttons
--primary-foreground: 0 0% 9% → dark text on primary
--secondary: 0 0% 14.9%     → #262626
--muted: 0 0% 14.9%         → #262626
--muted-foreground: 0 0% 63.9% → #a3a3a3
--accent: 0 0% 14.9%        → #262626
--destructive: 0 62.8% 30.6% → deep red
--border: 0 0% 14.9%        → #262626
--ring: 0 0% 83.1%          → light ring
--radius: 0.5rem
```

### Semantic Colors (Tailwind classes)
| Purpose | Class | Hex |
|---|---|---|
| Background | `bg-zinc-950` | #09090b |
| Card Background | `bg-zinc-950/60` | 60% opacity |
| Card Border | `border-zinc-800` | #27272a |
| Text Primary | `text-white` | #ffffff |
| Text Secondary | `text-zinc-400` | #a1a1aa |
| Text Muted | `text-zinc-500` | #71717a |
| Label Text | `text-zinc-400` | uppercase tracking-widest |
| Active/Live | `text-emerald-400` / `bg-emerald-500` | #34d399 |
| Warning | `text-amber-400` | #fbbf24 |
| Error | `text-red-400`/`text-red-500` | #f87171 |
| Input BG | `bg-zinc-900/50` | 50% opacity |
| Button Primary | `bg-white text-black` | Inverted |
| Button Outline | `border-zinc-800 text-zinc-400` | Ghost |

## 3. Typography System

| Element | Classes |
|---|---|
| Font Family | Inter (Google Fonts) |
| Hero Title | `text-[7rem] font-h1 tracking-tighter uppercase` |
| Page Title | `text-3xl font-bold tracking-tight` |
| Section Title | `text-xl sm:text-2xl font-bold` |
| Card Title | `text-2xl text-zinc-100` |
| Label | `text-xs font-semibold uppercase tracking-wider text-zinc-400` |
| Micro Label | `text-[10px] uppercase tracking-widest text-zinc-500` |
| Nano Label | `text-[9px] uppercase tracking-widest font-bold` |
| Body | `text-sm` |
| Mono | `font-mono text-xs` (coordinates, links) |

## 4. Layout Patterns

### Full-Screen App Shell (Dashboard)
```
┌─────────────────────────────────────┐
│  Header (h-14, sticky, blur)        │
├──────────┬──────────────────────────┤
│ Sidebar  │                          │
│ w-80     │      Map View            │
│ scroll   │      (flex-1)            │
│          │                          │
├──────────┴──────────────────────────┤
│  Footer (h-20, stats + actions)     │
└─────────────────────────────────────┘
```

### Centered Card (Auth/Register)
```
┌─────────────────────────────────────┐
│  DottedGlowBackground (z-0)        │
│                                     │
│      ┌──────────────────┐          │
│      │  Card (max-w-md) │          │
│      │  backdrop-blur   │          │
│      │  Form content    │          │
│      └──────────────────┘          │
│                                     │
└─────────────────────────────────────┘
```

## 5. Reusable UI Components

| Component | File | Used In |
|---|---|---|
| `Button` | `ui/button.tsx` | All pages |
| `Card` (+ Header/Content/Footer) | `ui/card.tsx` | Auth, register, dashboard |
| `Input` | `ui/input.tsx` | Forms |
| `Label` | `ui/label.tsx` | Forms |
| `Badge` | `ui/badge.tsx` | Status indicators |
| `Separator` | `ui/separator.tsx` | Layout dividers |
| `Form` | `ui/form.tsx` | Form validation |
| `DottedGlowBackground` | `ui/dotted-glow-background.tsx` | Auth/register pages |
| `MapView` | `MapView.tsx` | Dashboards, guest view |
| `HealthIndicator` | `HealthIndicator.tsx` | Status display |
| `Skeleton` | `Skeleton.tsx` | Loading states |
| `ErrorBoundary` | `ErrorBoundary.tsx` | Error handling |

## 6. Navigation Flow

```
/                       → Role Selection (Parent | Child)
├── /register/parent    → Parent Login/Register (dual-mode form)
│   ├── /parent/link-child  → Enter child's 6-digit code
│   └── /parent/dashboard   → Map + sidebar monitoring
├── /register/child     → Child Login/Register (dual-mode form)
│   ├── /auth/child         → Show PIN code, poll for link
│   └── /child/dashboard    → Map + sidebar with actions
├── /guest/[token]      → Read-only guest view
└── /dashboard/view     → Legacy dashboard view
```

## 7. Interaction Patterns

| Pattern | Implementation |
|---|---|
| Loading indicator | 3 pulsing dots (`animate-pulse` with staggered delays) |
| Session check | Full-screen loader while validating stored session |
| Auto-refresh | `setInterval` polling (2s-15s depending on context) |
| Error display | Inline red banner with icon |
| Success feedback | Green dot/icon + redirect |
| Copy to clipboard | Clipboard API + "✓ Copied!" feedback |
| Mobile sidebar | Transform-based slide (`-translate-x-full` → `translate-x-0`) |
| Map overlay | Absolute positioned badges on map (`z-20`) |
| Modal | Fixed overlay with backdrop-blur |

## 8. Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| Mobile (default) | Single column, hamburger menu, bottom drawer |
| `sm` (640px) | Larger spacing, visible labels |
| `md` (768px) | — |
| `lg` (1024px) | Side-by-side sidebar + map layout |
| `2xl` (1400px) | Container max-width |

## 9. Android Component Mapping

| Frontend Component | Android Equivalent |
|---|---|
| `DottedGlowBackground` | Custom `SurfaceView` or static gradient |
| `Card` (glassmorphism) | `CardView` with custom dark theme drawable |
| `Button` (primary) | `MaterialButton` with white bg, black text |
| `Button` (outline) | `MaterialButton` style `OutlinedButton` |
| `Input` | `TextInputEditText` with dark theme |
| `MapView` (MapLibre) | MapLibre Android SDK |
| Sidebar | `DrawerLayout` or `NavigationView` |
| Bottom bar | `BottomAppBar` or custom `LinearLayout` |
| Status dot (pulse) | `ObjectAnimator` alpha animation |
| OTP input (6-digit) | Custom `EditText` row or PIN view |
| Toast notifications | `Snackbar` or Android Toast |
| Modal dialog | `BottomSheetDialogFragment` |
