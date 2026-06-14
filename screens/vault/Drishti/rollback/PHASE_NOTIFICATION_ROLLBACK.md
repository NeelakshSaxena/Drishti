# Phase Rollback Notes: Notification Framework

## Rollback Trigger Conditions
- System UI crashes or severe latency when processing multiple high-frequency notifications.
- Battery drain caused by active `MediaController` callbacks failing to unregister on destruction.

## Rollback Procedure
1. Revert `AndroidManifest.xml` to remove the `DrishtiNotificationService` entry and its permission.
   ```bash
   git checkout HEAD~1 -- android/app/src/main/AndroidManifest.xml
   ```
2. Remove the injected `PrivacyManager` from `AppModule.kt`.
3. Delete the new source files:
   - `android/app/src/main/java/com/drishti/node/permissions/PrivacyManager.kt`
   - `android/app/src/main/java/com/drishti/node/services/DrishtiNotificationService.kt`
   - `android/app/src/main/java/com/drishti/node/telemetry/NotificationEventBus.kt`
   - `android/app/src/main/java/com/drishti/node/telemetry/collectors/NotificationCollector.kt`
4. Delete vault artifacts related to this phase:
   - `vault/Drishti/ingested/android/notification_framework.md`
   - `vault/Drishti/phase-reports/PHASE_NOTIFICATION.md`
