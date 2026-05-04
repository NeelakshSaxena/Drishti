# Drishti Frontend Integration Guide

## Overview

The Next.js frontend has been fully integrated with the FastAPI backend to manage children, trips, events, and locations. The UI features dark mode, real-time health checks, and a modular component architecture.

## Architecture

### API Layer (`lib/api.ts`)
- **Retry Logic**: Automatic retry with exponential backoff (3 attempts)
- **Error Handling**: Structured JSON error responses
- **Type Safety**: Full TypeScript support for all endpoints
- **CORS Ready**: Configured for Vercel + local development

### Components

#### 1. **HealthIndicator** (`components/HealthIndicator.tsx`)
- Auto-refreshing health check (configurable interval)
- Status indicators: 🟢 Connected, 🔴 Offline, ⚠️ Degraded
- Displays in header bar for quick visibility

#### 2. **ParentDashboard** (`components/ParentDashboard.tsx`)
- List all children with status
- Create new children
- Quick trip controls (Start/End)
- Current event preview
- Auto-refresh every 15 seconds
- Dark mode support

#### 3. **ChildPanel** (`components/ChildPanel.tsx`)
- Tab-based interface: Trip Management & Location Tracking
- Start/End trips
- Add events (Flight, Train, Bus, Car, Hostel, Hotel)
- Advanced through events (mark as complete & next)
- Update location with latitude/longitude
- Event details with ticket links
- Dark mode support

#### 4. **MapView** (`components/MapView.tsx`)
- Display route points (departure/arrival)
- OpenStreetMap integration
- Auto-center map based on points
- Non-interactive display
- Dark mode support

#### 5. **Input/Results Panels** (Legacy)
- Backward compatible with old trip verification flow
- Available at `/legacy` route
- Dark mode support

### Pages

#### Main Dashboard (`app/page.tsx`)
- **Parent View**: Display children and trip status
- **Child View**: Full trip and location management
- Dark mode toggle
- Health indicator in header
- Quick info panel with event types

#### Legacy Flow (`app/legacy/page.tsx`)
- Old trip verification endpoint
- Maintained for backward compatibility

## Features Implemented

### ✅ Backend Connection
- Configurable API base URL via `NEXT_PUBLIC_API_BASE_URL` environment variable
- Automatic retry logic with 1s delay between attempts
- CORS error handling with graceful degradation
- Fallback to localhost:8000 if env var not set

### ✅ API Layer Functions
```typescript
// Health & Status
healthCheck()                          // Check backend status

// Child Management
createChild(name)                      // Create new child
getChildren()                          // List all children
getChildDetails(childId)               // Get specific child

// Trip Management
startTrip(childId, events?)            // Start new trip
endTrip(childId)                       // End active trip

// Event Management
addEvent(tripId, event)                // Add event to trip
nextEvent(tripId)                      // Mark complete & advance

// Location Tracking
updateLocation(childId, lat, lng)      // Update child location
```

### ✅ Parent Dashboard
- Lists all children with active/inactive status
- Shows current event for active trips
- Quick-start trip button
- Create new child form
- Auto-refresh every 15 seconds
- Dark mode optimized

### ✅ Child Panel
**Trip Tab:**
- Start trip (creates first event as "current")
- Display current event with type, from/to, time, ticket URL
- Add new events (Flight, Train, Bus, Car, Hostel, Hotel)
- Advance to next event
- End trip

**Location Tab:**
- Input latitude/longitude
- Update button
- Display last known location with timestamp

### ✅ Health Indicator
- Real-time backend status
- Color-coded: Green (connected), Red (offline), Amber (degraded)
- Auto-refresh every 15 seconds
- Compact badge display

### ✅ Map Integration
- OpenStreetMap display
- Route point markers
- Auto-center to points
- Non-interactive (read-only)
- Marker labels and styling

### ✅ Dark Mode
- Tailwind class-based dark mode
- Toggle button in header
- Persists across page reloads via state
- Complete color scheme updates:
  - Background: white → slate-950
  - Text: slate-950 → slate-50
  - Cards: white → slate-900
  - Borders: slate-200 → slate-700
  - Accents preserved for visibility

## Configuration

### Environment Variables

```bash
# .env.local or .env.production
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Development:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Production (Vercel):**
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.render.com
```

### Default Locations

If no environment variable is set:
- Development: `http://127.0.0.1:8000`
- Default: `http://127.0.0.1:8000`

## Component Usage

### Using the Main Dashboard
```tsx
import { ParentDashboard } from "@/components/ParentDashboard";
import { ChildPanel } from "@/components/ChildPanel";

export default function Home() {
  const [selected, setSelected] = useState<Child | null>(null);
  
  return selected ? (
    <ChildPanel child={selected} onBack={() => setSelected(null)} />
  ) : (
    <ParentDashboard onSelectChild={setSelected} />
  );
}
```

### Using Health Indicator
```tsx
import { HealthIndicator } from "@/components/HealthIndicator";

export default function Header() {
  return (
    <header>
      <HealthIndicator autoRefresh interval={15000} />
    </header>
  );
}
```

### Using API Functions
```tsx
import { 
  createChild, 
  getChildren, 
  startTrip, 
  addEvent 
} from "@/lib/api";

async function handleCreateChild(name: string) {
  try {
    const child = await createChild(name);
    console.log("Created:", child);
  } catch (error) {
    console.error("Failed:", error);
  }
}
```

## Error Handling

All API functions throw errors that can be caught and handled:

```typescript
try {
  const result = await createChild("Alice");
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
}
```

Common errors:
- Network unreachable
- 404 Child not found
- 400 Invalid request
- 500 Server error

## Data Flow

```
User → Component → API Function → Fetch with Retry → Backend
                ↓
          Error Handling
                ↓
          State Update
                ↓
        UI Re-render
```

### Example: Create Child Flow
1. User enters name and clicks "Add"
2. `handleCreateChild()` called
3. `createChild(name)` makes API request
4. Retry logic handles network failures
5. State updates with new child
6. List re-renders with new child
7. Success notification shown

## Performance Optimizations

1. **Auto-Refresh**: 15-second intervals prevent excessive API calls
2. **Retry Logic**: Smart retries reduce impact of transient failures
3. **Type Safety**: TypeScript catches errors at compile time
4. **Component Memoization**: React prevents unnecessary re-renders
5. **CSS-in-JS**: Tailwind generates minimal CSS

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dark Mode Implementation

The dark mode uses Tailwind's class-based system:

```tsx
// Toggle dark mode
document.documentElement.classList.add("dark");
document.documentElement.classList.remove("dark");

// Tailwind classes
className="bg-white dark:bg-slate-900"
className="text-slate-950 dark:text-slate-50"
```

## Troubleshooting

### Backend Not Connecting
1. Check `NEXT_PUBLIC_API_BASE_URL` environment variable
2. Verify backend is running on configured port
3. Check browser console for CORS errors
4. Enable network tab to see actual requests

### Dark Mode Not Working
1. Ensure `tailwind.config.ts` has `darkMode: "class"`
2. Check that `html` element has `class="dark"`
3. Clear browser cache

### Components Not Updating
1. Check React DevTools for state changes
2. Verify API calls are successful
3. Check console for JavaScript errors
4. Inspect network tab for API responses

## Next Steps (Optional)

1. **Real-time Updates**: Add WebSocket support
2. **Analytics**: Track user actions
3. **Notifications**: Push notifications for events
4. **Offline Support**: Service worker caching
5. **Progressive Enhancement**: Work offline, sync online

## File Structure

```
frontend/
├── app/
│   ├── page.tsx              # Main dashboard
│   ├── legacy/page.tsx       # Legacy verification flow
│   ├── layout.tsx            # Root layout with dark mode
│   └── globals.css           # Tailwind imports
├── components/
│   ├── HealthIndicator.tsx   # Backend status indicator
│   ├── ParentDashboard.tsx   # Children list & management
│   ├── ChildPanel.tsx        # Trip & location management
│   ├── MapView.tsx           # Map display
│   ├── InputPanel.tsx        # Trip input (legacy)
│   ├── ResultsPanel.tsx      # Results display (legacy)
│   └── ui/
│       └── map.tsx           # Map component
├── lib/
│   ├── api.ts                # API client functions
│   └── utils.ts              # Utility functions
├── package.json
├── tailwind.config.ts        # Tailwind config with dark mode
└── tsconfig.json
```

## API Response Examples

### Health Check
```json
{
  "status": "ok",
  "backend": "running",
  "services": {
    "api": true,
    "memory_store": true
  },
  "errors": []
}
```

### Create Child
```json
{
  "id": "uuid",
  "name": "Alice",
  "active_trip_id": null,
  "created_at": "2026-05-04T15:47:01.485332"
}
```

### Start Trip
```json
{
  "status": "success",
  "trip": {
    "id": "uuid",
    "child_id": "uuid",
    "status": "active",
    "current_event_index": 0,
    "events": [...],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` for main dashboard and `http://localhost:3000/legacy` for legacy verification flow.
