# Drishti Android App UI — Development Phases

---

# Phase 1 — Foundation Setup

## Goal

Establish app structure, theme system, and reusable UI base.

## Tasks

### Project Setup

- Initialize Android project
- Configure package structure
- Add navigation setup
- Configure dark theme

### Theme System

Create:

- colors
- typography
- spacing
- card styles
- button styles

### Core Palette

```plaintext id="p1"
Background: #050505
Card: #111111
Accent Cyan: #6FE7FF
Text Primary: #F2F2F2
Text Secondary: #8C8C8C
Success: #44D17A
Warning: #F2C94C
Error: #EB5757
```

### Reusable Components

Build:

- StatusChip
- MetricTile
- PrimaryButton
- ToggleSwitch
- LogPanel
- CardContainer

---

# Phase 2 — Main Dashboard UI

## Goal

Create the complete static home screen.

## Sections

### Header

Contains:

- app title
- ONLINE indicator
- subtitle
- node health sentence

### Metrics Card

Display:

- uptime
- connection
- last ping
- battery
- sync state
- last sync

### Service Control Card

Contains:

- daemon status
- ON/OFF toggle

### Action Buttons

Buttons:

- Restart
- Force Sync
- Logs

### Logs Section

Terminal-style stream panel.

### Footer

Display:

- Node ID
- App version

---

# Phase 3 — State Management

## Goal

Connect UI to real state.

## Add Logic For

### Service States

```plaintext id="p2"
ONLINE
OFFLINE
RECONNECTING
SYNCING
ERROR
```

### Dynamic UI

Update:

- colors
- labels
- indicators
- button states

### Live Metrics

Connect:

- uptime timer
- ping updates
- sync timestamps
- connection monitoring

---

# Phase 4 — Background Service Integration

## Goal

Make Drishti function as an actual node daemon.

## Implement

### Android Foreground Service

Required for:

- persistent node operation
- uptime stability

### Notifications

Persistent notification:

```plaintext id="p3"
Drishti Node Active
Gateway Connected
```

### Manual Controls

Implement:

- start service
- stop service
- restart service

### Auto-Recovery

Add:

- reconnect handling
- service watchdog
- boot persistence

---

# Phase 5 — Logs & Monitoring

## Goal

Provide operational visibility.

## Features

### Live Log Stream

Show:

- gateway events
- sync events
- heartbeat messages
- failures

### Log Levels

```plaintext id="p4"
INFO
WARN
ERROR
DEBUG
```

### Export Logs

Optional:

- share logs
- save logs

---

# Phase 6 — Gateway Connectivity

## Goal

Connect app to backend infrastructure.

## Features

### Heartbeat System

Periodic:

- ping
- node health update

### Sync Engine

Sync:

- status
- metadata
- uptime

### Failure Handling

Show:

- retry state
- unreachable gateway
- degraded mode

---

# Phase 7 — Polish & Production

## Goal

Make app production-ready.

## Polish Tasks

### Animations

Very subtle:

- status pulse
- toggle transitions
- loading shimmer

### Performance

Optimize:

- battery usage
- background tasks
- rendering

### Accessibility

Ensure:

- readable contrast
- scalable fonts
- proper touch targets

### APK Optimization

- shrink resources
- optimize assets
- enable proguard/minify

---

# Phase 8 — Future Features (Optional)

## Remote Control

- remote node management
- web dashboard

## Analytics

- bandwidth stats
- uptime graphs
- connection history

## Security

- encrypted node auth
- signed heartbeats
- device verification

## Multi-Node Support

Monitor:

- multiple gateways
- distributed nodes

---

# Recommended Development Order

```plaintext id="p5"
1. Theme System
2. Static Dashboard
3. Toggle Logic
4. Background Service
5. Live Metrics
6. Logs
7. Gateway Integration
8. Production Polish
```

---

# Most Important Principle

Drishti should feel:

- reliable
- quiet
- operational
- lightweight

Avoid turning it into:

- flashy dashboard software
- animated cyberpunk UI
- feature-heavy clutter

The simplicity is currently one of its strongest qualities.
