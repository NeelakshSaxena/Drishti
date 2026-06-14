# M1 — Frontend Alignment Phase Report

> **Status**: ✅ COMPLETE
> **Date**: 2026-06-14
> **Branch**: `android/ui`

---

## Executive Summary

Complete analysis of the Drishti frontend architecture, authentication flow, API contracts, WebSocket lifecycle, UI design language, and Stitch screen mockups. All findings documented in `vault/Drishti/raw/frontend-analysis/` and ingested summaries in `vault/Drishti/ingested/frontend/`.

---

## Verification Checks

### ✅ Login API Identified

| Role | Endpoint | Method | Body |
|---|---|---|---|
| Parent | `/family/parent/login` | POST | `{ name?, email, password? }` |
| Child | `/family/child/login` | POST | `{ name?, email, password? }` |

**Response**: `{ success: bool, parent_id/child_id, name }` or `{ success: false, message }`

### ✅ Refresh Token Flow Identified

**Finding**: There is NO refresh token flow. The system uses session-ID-based auth:
- Entity IDs (`parent_id`, `child_id`) stored in `localStorage`/`sessionStorage`
- Validated on each page mount by calling the dashboard endpoint
- No JWT, no Bearer tokens, no HTTP-only cookies
- Stale sessions cleared when backend validation fails

### ✅ WebSocket Endpoints Identified

| Endpoint | Protocol | Auth | Purpose |
|---|---|---|---|
| `/ws/device?token={token}` | WebSocket | Query param token | Device gateway |
| `/ws/dispatch/{device_id}` | HTTP POST | None (admin) | Command dispatch |

**Critical Finding**: The family tracking frontend does NOT use WebSockets. All real-time features use HTTP polling (`setInterval` at 2-5s intervals). WebSockets are exclusively for the device/node subsystem.

### ✅ Frontend Persistence Strategy Understood

| Mechanism | Used For | Scope |
|---|---|---|
| `localStorage` | "Remember Me" sessions, backend URL | Persistent across sessions |
| `sessionStorage` | Temporary sessions (unchecked "Remember Me") | Per-tab |
| `navigator.geolocation` | Live location tracking | Per-session |
| None | No IndexedDB, no service workers, no offline cache | — |

### ✅ Stitch Screen Mappings Documented

All 8 Stitch mockup screens mapped to frontend routes and Android activities:
- `register.png` → `/` → `RoleSelectionActivity`
- `parent_register.png` → `/register/parent` → `ParentAuthActivity`
- `child_register.png` → `/register/child` → `ChildAuthActivity`
- `child_auth.png` → `/auth/child` → `ChildPinFragment`
- `parent_add.png` → `/parent/link-child` → `LinkChildActivity`
- `dashboard_parent.png` → `/parent/dashboard` → `ParentDashboardActivity`
- `dashboard_child.png` → `/child/dashboard` → `ChildDashboardActivity`
- `dashboard_invite.png` → `/guest/[token]` → `GuestViewActivity`

---

## Stop Condition Verification

### ✅ How Frontend Authenticates

1. User enters email + password on `/register/{role}` page
2. Frontend POSTs to `/family/{role}/login` (or `/init` for signup)
3. Backend returns `{ success: true, {role}_id, name }`
4. Frontend stores ID in `localStorage` (or `sessionStorage` if no "Remember Me")
5. On every protected page mount: read stored ID → call dashboard API → validate entity exists
6. If invalid: clear storage → redirect to `/register/{role}`

**No JWT, no tokens, no server sessions.** The ID itself IS the session.

### ✅ How Sessions Persist

- **Primary**: `localStorage.setItem('{role}_id', id)` — survives browser close
- **Fallback**: `sessionStorage` — cleared on tab close
- **Validation**: Each page validates stored ID against backend on mount
- **Stale handling**: If backend returns 404/error → clear all keys → redirect to login
- **No expiry**: Sessions never expire client-side (only invalidated by backend deletion)

### ✅ How WebSocket Reconnect Works

- **Device gateway**: Client connects with `?token=xxx` → validated → enters message loop
- **On disconnect**: Server sets device status to "offline", removes from connection map
- **No server-side reconnect**: Client must re-establish with same token
- **Android requirement**: Implement exponential backoff (1s→30s), heartbeat (30s), offline queue

### ✅ How Android Should Mirror Frontend Behavior

| Frontend Behavior | Android Implementation |
|---|---|
| `localStorage` → `SharedPreferences` | `EncryptedSharedPreferences` |
| `sessionStorage` → in-memory | ViewModel-scoped variables |
| `setInterval` polling → coroutines | `repeatOnLifecycle` + `delay()` |
| `navigator.geolocation` → FusedLocation | `FusedLocationProviderClient` |
| `fetch()` API calls → Retrofit | Retrofit2 + OkHttp3 |
| Query param auth (`?parent_id=X`) | `@Query` annotation |
| No `Authorization` header | No interceptor needed |
| Dark theme (zinc-950) | Material 3 dark theme |
| MapLibre GL JS → MapLibre Android | MapLibre Android SDK |
| `router.push()` → Navigation | Jetpack Navigation Component |

---

## Deliverables Index

### Raw Analysis (`vault/Drishti/raw/frontend-analysis/`)
1. [api-contract-map.md](../raw/frontend-analysis/api-contract-map.md) — All 14 endpoint groups
2. [auth-lifecycle.md](../raw/frontend-analysis/auth-lifecycle.md) — Sequence diagrams + storage strategy
3. [websocket-lifecycle.md](../raw/frontend-analysis/websocket-lifecycle.md) — WS protocol + message types
4. [ui-component-mapping.md](../raw/frontend-analysis/ui-component-mapping.md) — Design tokens + Android mapping
5. [navigation-flow.md](../raw/frontend-analysis/navigation-flow.md) — Route graph + Stitch mapping
6. [android-recommendations.md](../raw/frontend-analysis/android-recommendations.md) — Arch + implementation guidance

### Ingested Summaries (`vault/Drishti/ingested/frontend/`)
1. [Architecture-Summary.md](../ingested/frontend/Architecture-Summary.md)
2. [API-Endpoints.md](../ingested/frontend/API-Endpoints.md)
3. [Stitch-Screen-Mapping.md](../ingested/frontend/Stitch-Screen-Mapping.md)

---

## Key Risks for Android

1. **No auth security**: Anyone with a UUID can access dashboards. Android should implement token-based auth when backend adds it.
2. **Plaintext passwords**: Backend stores/compares passwords in plaintext. Don't add client-side hashing — wait for backend to implement proper bcrypt.
3. **Polling-heavy architecture**: 5s polling intervals consume battery on Android. Consider implementing push notifications or WebSocket upgrade for family routes.
4. **No offline support**: Frontend has zero offline capability. Android should add Room DB caching for dashboard state.
5. **Location field mismatch**: Frontend uses `lon` (not `lng`) in API calls. Android must match this exactly.
