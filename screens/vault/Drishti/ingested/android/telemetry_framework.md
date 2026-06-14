# Telemetry Framework Summary

## Implementation Summary
The telemetry framework has been implemented in the Drishti Node Android application. It introduces a `TelemetryManager` orchestrating multiple modular collectors. Features include event throttling (batch flush every 5 seconds), delta updates (events are only queued if data state changes), and permissions-aware execution.

## Changed Files List
- `android/app/src/main/AndroidManifest.xml` (Permissions added)
- `android/app/src/main/java/com/drishti/node/core/AppModule.kt` (Hilt injections added)
- `android/app/src/main/java/com/drishti/node/services/NodeForegroundService.kt` (Started `TelemetryManager`)
- `android/app/src/main/java/com/drishti/node/telemetry/models/TelemetryModels.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/TelemetryCollector.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/TelemetryManager.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/collectors/BatteryCollector.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/collectors/NetworkCollector.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/collectors/ScreenStateCollector.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/collectors/LocationCollector.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/collectors/BluetoothCollector.kt`
- `android/app/src/main/java/com/drishti/node/telemetry/collectors/MediaPlaybackCollector.kt`

## Architecture Notes
- **Modular Collectors**: Implemented using Kotlin Flow. BroadcastReceiver-based collectors use `callbackFlow` while polled collectors use standard `flow` loops.
- **Delta Updates**: Implemented via a `ConcurrentHashMap` cache in `TelemetryManager`. Only events with different data maps from the previous emission are queued.
- **Batching & Throttling**: Batch arrays are flushed every 5 seconds asynchronously to prevent websocket packet storms.
- **Permissions**: `LocationCollector` safely checks `PermissionHelper.hasPermission` before emitting data, ensuring no security exceptions crash the service.

## Unresolved Issues
- Media and Bluetooth collectors are currently using mock output. They require actual Android API hooks (e.g. `AudioManager`, `BluetoothManager`) to fetch real data.
- Batch payload serialization currently relies on simple string formatting. Must integrate Moshi or Gson.
