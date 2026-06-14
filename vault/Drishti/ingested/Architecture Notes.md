---
title: Architecture Notes
phase: D4-A5
generated: 2026-06-14T14:46:00+05:30
related:
  - [[Implementation Summary]]
  - [[Changed Files List]]
  - [[Unresolved Issues]]
---

# Architecture Notes

The Backend Connectivity layer was implemented using OkHttp's WebSocket interface within `GatewayClient`.
To adhere to modern Android architecture, `GatewayClient` exposes state using Kotlin `StateFlow`. This ensures `MainActivity` can observe state changes asynchronously without memory leaks, using `lifecycleScope.launch`.
The background reconnection logic avoids hanging the main UI thread. 
UI Polish (Phase 5) leverages Android's native `animateLayoutChanges` framework parameter to provide zero-code smooth transitions on the static Dashboard UI as metrics change dynamically.

Related:
- [[Implementation Summary]]
- [[Changed Files List]]
- [[Unresolved Issues]]
