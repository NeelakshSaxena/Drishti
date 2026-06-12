---\ntitle: Architecture Notes\nphase: Phase_FullSystemValidation\ngenerated: 2026-06-12T08:38:18Z\nrelated:\n  - [[Implementation Summary]]\n  - [[Changed Files List]]\n  - [[Phase Report]]\n  - [[Architecture Report]]\n---\n\n# Architecture Notes

- **End-to-End Flow**: Android device boot triggers `BootReceiver`, kicking off `NodeForegroundService`. The service loads keys from `EncryptedSharedPreferences`, authenticates via WSS to `/api/device/sync`, and spins up `TelemetryManager` and `AudioCollector`. Backend stores this in `TemporalStore` making it queryable by agents.
- **Offline Recovery**: Disconnects trigger `OfflineQueue` logic. Android drops into an exponential backoff loop while WorkManager's `HeartbeatWorker` periodically tries to force reconnection on network-state broadcast intent.
- **Command Dispatch**: The backend sends structured JSON via WSS. `CommandRouting` processes it on Android, performing actions like capability toggles without restarting the service.

Related:
- [[Implementation Summary]]
- [[Changed Files List]]
- [[Phase Report]]
- [[Architecture Report]]
