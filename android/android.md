# Drishti Android UI Development Plan

A phased implementation roadmap with completion and verification checkpoints.

---

# Phase 1 — Foundation Setup

## Goal

Create the basic Android app structure and theme system.

---

## Tasks

### Project Setup

- Initialize project
- Configure package structure
- Setup navigation/root screen
- Enable dark mode

### Theme System

Create:

- colors
- typography
- spacing
- card styles
- button styles

### Core Palette

Recommended:

```plaintext id="p1"
Background: #050505
Card: #101010
Border: #1A1A1A
Accent Cyan: #6FE7FF
Success: #22C55E
Warning: #FACC15
Error: #EF4444
Text Primary: #FFFFFF
Text Secondary: #8B8B8B
```

---

## Deliverables

```plaintext id="p2"
✓ Main screen opens
✓ Dark theme working
✓ Reusable UI components created
✓ Fonts rendering properly
```

---

## Stop Condition

STOP when:

- theme is visually stable
- spacing system is consistent
- reusable components exist

DO NOT move ahead if:

- colors are inconsistent
- layout system is unstable
- typography feels random

---

## Verification Checklist

```plaintext id="p3"
[ ] App launches successfully
[ ] No white flashes during startup
[ ] Dark mode consistent
[ ] Components reusable
[ ] No hardcoded random spacing values
```

---

# Phase 2 — Static Dashboard UI

## Goal

Build the full static UI exactly like the mockup.

---

## Tasks

### Header

Create:

- title
- status dot
- subtitle
- operational status text

### Metrics Card

Add:

- uptime
- connection
- ping
- gateway
- battery
- sync
- last sync

### Service Card

Add:

- service name
- daemon description
- toggle switch

### Action Buttons

Create:

- Restart
- Force Sync
- Logs

### Logs Panel

Create:

- terminal style stream
- monospaced font
- scrolling area

### Footer

Add:

- node ID
- version

---

## Deliverables

```plaintext id="p4"
✓ Entire screen matches design
✓ Responsive layout works
✓ Scroll behavior works
✓ Cards aligned correctly
```

---

## Stop Condition

STOP when:

- the UI visually matches mockup
- spacing is polished
- no overflowing components exist

DO NOT proceed if:

- alignment issues remain
- cards resize incorrectly
- typography inconsistent

---

## Verification Checklist

```plaintext id="p5"
[ ] UI matches mockup
[ ] Buttons clickable
[ ] Toggle animates
[ ] No clipping on smaller screens
[ ] Text readable on AMOLED devices
```

---

# Phase 3 — State Management

## Goal

Connect UI to internal application state.

---

## Tasks

### Create App State

Track:

```plaintext id="p6"
isConnected
isServiceRunning
uptime
lastPing
syncStatus
battery
gatewayStatus
logs
```

### Toggle Logic

Implement:

- enable service
- disable service

### Status Logic

Implement:

- online/offline/reconnecting

### Live Log Updates

Append logs dynamically.

---

## Deliverables

```plaintext id="p7"
✓ UI updates dynamically
✓ Toggle changes actual state
✓ Status indicators reactive
✓ Logs update live
```

---

## Stop Condition

STOP when:

- state updates are reliable
- no stale UI exists
- all indicators update correctly

DO NOT continue if:

- state desync occurs
- toggle visually mismatches service state

---

## Verification Checklist

```plaintext id="p8"
[ ] Toggle updates UI instantly
[ ] State survives screen refresh
[ ] Status dot changes correctly
[ ] Logs append in realtime
```

---

# Phase 4 — Backend Connectivity

## Goal

Connect app to Drishti Node backend/gateway.

---

## Tasks

### API Layer

Implement:

- heartbeat endpoint
- status endpoint
- sync endpoint
- restart endpoint

### Polling System

Add:

- ping interval
- uptime refresh
- sync refresh

### Error Handling

Handle:

- timeout
- unreachable gateway
- reconnect logic

---

## Deliverables

```plaintext id="p9"
✓ Real backend connected
✓ Metrics fetched live
✓ Restart works
✓ Sync works
```

---

## Stop Condition

STOP when:

- backend communication stable
- reconnect logic reliable
- no UI freezing occurs

DO NOT proceed if:

- requests hang
- app crashes on disconnect
- stale statuses appear

---

## Verification Checklist

```plaintext id="p10"
[ ] Ping updates correctly
[ ] Uptime increments
[ ] Offline mode detected
[ ] Gateway disconnect handled
[ ] Logs sync with backend
```

---

# Phase 5 — Stability & Polish

## Goal

Production-quality refinement.

---

## Tasks

### UI Polish

- smooth animations
- spacing refinements
- typography cleanup

### Performance

- optimize rendering
- reduce unnecessary updates

### Reliability

- background recovery
- service persistence
- battery optimization handling

### APK Prep

- app icon integration
- splash screen
- permissions
- signing config

---

## Deliverables

```plaintext id="p11"
✓ Stable release build
✓ Production-ready UI
✓ Smooth interactions
✓ Clean APK generation
```

---

## Stop Condition

STOP when:

- app feels reliable
- visuals consistent
- no major UX friction exists

---

## Verification Checklist

```plaintext id="p12"
[ ] APK builds successfully
[ ] No UI jitter
[ ] No crashes
[ ] Service recovers properly
[ ] App usable for long sessions
```

---

# Phase 6 — Optional Advanced Features

## Future Additions

### Monitoring

- bandwidth graphs
- CPU/RAM stats
- packet throughput

### Remote Features

- remote node management
- multi-device dashboard

### Security

- authentication
- encrypted sync
- node verification

### Advanced UX

- collapsible logs
- realtime charts
- notification system

---

# Recommended Development Order

```plaintext id="p13"
1. Foundation
2. Static UI
3. State Management
4. Backend Connectivity
5. Stability/Polish
6. Advanced Features
```

---

# Important Advice

Do NOT start backend integration too early.

Most projects become messy because:

- UI unfinished
- state architecture unclear
- backend added prematurely

First make the UI:

- stable
- predictable
- polished

Then connect logic.

That approach scales much better.
