---
title: Unresolved Issues
phase: D4-A5
generated: 2026-06-14T14:46:00+05:30
related:
  - [[Verification Report]]
---

# Unresolved Issues

1. **Target WebSocket URL:** The `GatewayClient` is currently hardcoded to `ws://localhost:8080/ws`. This must be extracted into `BuildConfig` or a user-configurable settings panel before production release.
2. **Foreground Service Synchronization:** Manual control of `isServiceRunning` via the UI toggle works, but it does not strictly monitor if the OS killed the service. This requires a robust IPC binder or BroadcastReceiver loop for absolute synchronization.

Related:
- [[Verification Report]]
