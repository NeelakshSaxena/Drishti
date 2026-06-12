---\ntitle: bootstrap
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related: []
---\n\n# Android Node Bootstrap Summary

## Implementation Summary
The Drishti Node Android application has been initialized with Clean Architecture principles. It includes a Foreground Service (`NodeForegroundService`) that maintains a persistent WebSocket connection to the backend telemetry ingestion service. Hilt is used for Dependency Injection, and a WorkManager fallback (`HeartbeatWorker`) ensures resilience when the foreground service is temporarily interrupted.

## Changed Files List
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/drishti/node/DrishtiApplication.kt`
- `android/app/src/main/java/com/drishti/node/MainActivity.kt`
- `android/app/src/main/java/com/drishti/node/core/Constants.kt`
- `android/app/src/main/java/com/drishti/node/core/AppModule.kt`
- `android/app/src/main/java/com/drishti/node/networking/AuthTokenManager.kt`
- `android/app/src/main/java/com/drishti/node/networking/WebSocketManager.kt`
- `android/app/src/main/java/com/drishti/node/storage/LogStorage.kt`
- `android/app/src/main/java/com/drishti/node/services/NodeForegroundService.kt`
- `android/app/src/main/java/com/drishti/node/services/HeartbeatWorker.kt`
- `android/app/src/main/java/com/drishti/node/services/BootReceiver.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/BatteryCollector.kt`

## Architecture Notes
- **Core**: Contains Constants and Hilt DI modules (`AppModule`).
- **Networking**: Encapsulates OkHttp WebSocket client (`WebSocketManager`) with exponential backoff reconnect logic. Authentication is abstracted via `AuthTokenManager`.
- **Services**: `NodeForegroundService` runs in the background and sends a heartbeat every 30 seconds. `BootReceiver` ensures the service starts on device boot. `HeartbeatWorker` acts as a WorkManager fallback.
- **Telemetry**: Modular collectors, such as `BatteryCollector`, extract system state to be sent over the socket.
- **Storage**: `LogStorage` handles structured logging.

## Unresolved Issues
- Proper JWT token retrieval mechanism needs integration with an actual auth flow (currently mocked).
- Telemetry payload structuring needs synchronization with backend schema updates.\n\n---\n\n## Related Documents\nNone\n\n## Referenced By\nNone\n