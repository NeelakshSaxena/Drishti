---\ntitle: Architecture Notes
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related:
- '[[Architecture Report]]'
- '[[Changed Files List]]'
- '[[Implementation Summary]]'
- '[[Phase Report]]'
---\n\n\n\n# Architecture Notes

- **End-to-End Flow**: Android device boot triggers `BootReceiver`, kicking off `NodeForegroundService`. The service loads keys from `EncryptedSharedPreferences`, authenticates via WSS to `/api/device/sync`, and spins up `TelemetryManager` and `AudioCollector`. Backend stores this in `TemporalStore` making it queryable by agents.
- **Offline Recovery**: Disconnects trigger `OfflineQueue` logic. Android drops into an exponential backoff loop while WorkManager's `HeartbeatWorker` periodically tries to force reconnection on network-state broadcast intent.
- **Command Dispatch**: The backend sends structured JSON via WSS. `CommandRouting` processes it on Android, performing actions like capability toggles without restarting the service.

Related:
- [[Implementation Summary]]
- [[Changed Files List]]
- [[Phase Report]]
- [[Architecture Report]]\n\n---\n\n## Related Documents\n- [[Architecture Report]]\n- [[Changed Files List]]\n- [[Implementation Summary]]\n- [[Phase Report]]\n\n## Referenced By\n- [[Architecture Report]]\n- [[Changed Files List]]\n- [[Implementation Summary]]\n- [[Phase Index]]\n- [[Phase Report]]\n