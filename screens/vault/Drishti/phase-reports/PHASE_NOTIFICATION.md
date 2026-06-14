# Phase Report: Notification & Media Framework

## Objectives
- Integrate `NotificationListenerService` to capture app notifications.
- Enable OS-level `MediaSessionManager` for real playback metadata.
- Implement privacy controls (allowlists/blocklists).
- Ensure backend receives clean events without spam.

## Execution Details
- Added [DrishtiNotificationService.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/services/DrishtiNotificationService.kt) binding to `android.service.notification.NotificationListenerService`.
- Created [PrivacyManager.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/permissions/PrivacyManager.kt) providing explicit string-matching for blocked packages and notification categories.
- Implemented `MediaController.Callback` inside the notification service to capture realtime track metadata (Title, Artist) and playback state.
- Decoupled emission via `NotificationEventBus` mapping directly into the existing `TelemetryManager` logic.

## Stop Condition Fulfillment
- **backend receives clean events**: Payload mapping strictly filters `sourceApp`, `category`, and timestamps.
- **no notification spam**: Achieved by the existing 5-second `TelemetryManager` throttle and dropping SystemUI updates via `PrivacyManager`.
- **filters verified**: Checked via mock execution logs validating rejection of `com.whatsapp`.

## Next Steps
- Expose the blocklist configurable options to the UI so users can dynamically block specific apps.
- Implement UI prompt prompting the user to grant the `BIND_NOTIFICATION_LISTENER_SERVICE` permission.
