# Unresolved Issues

1. **Hardcoded Configurations:** The WebSocket URL (`ws://localhost:8080/ws`) is currently hardcoded in `GatewayClient.kt`. Future work should move this to `BuildConfig` or a settings repository.
2. **Foreground Service Runtime Permissions:** We bypassed Android 14 strict Foreground Service initialization restrictions by granting `RECORD_AUDIO`, `BLUETOOTH_CONNECT`, and `ACCESS_FINE_LOCATION` via `adb pm grant`. For a production release, we must implement a standard Android runtime permissions dialog logic in `MainActivity.kt` before calling `startForegroundService()`.
3. **Service Lifecycle Sync:** While the foreground service is operational, future development should implement a more robust IPC Binder or `BroadcastReceiver` system to ensure the UI perfectly syncs with the OS service status (e.g. switch state).

## Links
- [[Verification-Report]]
