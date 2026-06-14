---\ntitle: PHASE_TELEMETRY_ROLLBACK
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related: []
---\n\n# Phase Rollback Notes: Telemetry Framework

## Rollback Trigger Conditions
- Memory leaks caused by unclosed `callbackFlow` receivers.
- Overwhelming WebSocket traffic causing backend degradation despite delta checks.
- ANRs from heavy polling tasks.

## Rollback Procedure
1. Revert `AppModule.kt` and `NodeForegroundService.kt` to the commit prior to this phase (`android/app/base`).
   ```bash
   git checkout HEAD~1 -- android/app/src/main/java/com/drishti/node/core/AppModule.kt
   git checkout HEAD~1 -- android/app/src/main/java/com/drishti/node/services/NodeForegroundService.kt
   ```
2. Delete the `telemetry` directory and its contents.
   ```bash
   Remove-Item -Recurse -Force g:\Projects\Drishti\android\app\src\main\java\com\drishti\node\telemetry
   ```
3. Remove the new permissions from `AndroidManifest.xml`.
4. Delete vault artifacts related to this phase:
   - `vault/Drishti/ingested/android/telemetry_framework.md`
   - `vault/Drishti/phase-reports/PHASE_TELEMETRY.md`\n\n---\n\n## Related Documents\nNone\n\n## Referenced By\nNone\n