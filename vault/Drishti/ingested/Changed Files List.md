---
title: Changed Files List
phase: D4-A5
generated: 2026-06-14T14:46:00+05:30
related:
  - [[Architecture Notes]]
  - [[Implementation Summary]]
---

# Changed Files List

- `android/app/src/main/java/com/drishti/node/networking/GatewayClient.kt`: (Added) Implements WebSocket connectivity, heartbeat logic, and `StateFlow` state exposure.
- `android/app/src/main/java/com/drishti/node/MainActivity.kt`: (Modified) Integrated `GatewayClient` for real-time connection status, replacing simulated logic.
- `android/app/src/main/res/layout/activity_main.xml`: (Modified) Added `android:animateLayoutChanges="true"` to provide smooth UX transitions for Phase 5 UI Polish.

Related:
- [[Architecture Notes]]
- [[Implementation Summary]]