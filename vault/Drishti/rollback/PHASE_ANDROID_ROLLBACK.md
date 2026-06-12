# Phase Rollback Notes: Android Node

## Rollback Trigger Conditions
- Severe battery drain (>5% per hour in background) detected in field testing.
- `NodeForegroundService` causing ANRs (Application Not Responding) due to main thread blocking.
- Memory leak in `WebSocketManager` leading to OOM crashes.

## Rollback Procedure
1. Delete the `g:\Projects\Drishti\android\app` directory to remove the base client.
   ```bash
   Remove-Item -Recurse -Force g:\Projects\Drishti\android\app
   ```
2. Remove Hilt and OkHttp references if they were injected to root `build.gradle` (N/A for manual script build).
3. Delete vault artifacts related to this phase:
   - `vault/Drishti/ingested/android/bootstrap.md`
   - `vault/Drishti/phase-reports/PHASE_ANDROID.md`
4. Revert any backend changes made to support this Android client (if applicable).
