---
title: Rollback Notes
phase: D4-A5
generated: 2026-06-14T14:46:00+05:30
related:
  - [[Phase Report]]
---

# Rollback Notes

If the WebSocket polling causes excessive battery drain or thread lockups on low-end hardware:
1. Revert `MainActivity.kt` to its simulated-state branch.
2. Remove `GatewayClient.kt`.
3. Transition the continuous WebSocket (`ws://`) polling to standard HTTP REST (`http://`) polling utilizing a periodic `WorkManager` enqueue to throttle network wakelocks.

Related:
- [[Phase Report]]
