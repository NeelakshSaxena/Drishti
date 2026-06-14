# Notification & Media Session Integration Summary

## Implementation Summary
Integrated an Android `NotificationListenerService` via [DrishtiNotificationService.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/services/DrishtiNotificationService.kt) which securely captures notification posts and reads active `MediaController` sessions. The integration utilizes a singleton [NotificationEventBus.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/telemetry/NotificationEventBus.kt) to dispatch extracted metadata asynchronously without blocking the OS notification pipeline. A configurable blocklist is managed by [PrivacyManager.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/permissions/PrivacyManager.kt) to ensure no sensitive notifications (e.g., banking or messaging) or system spam are tracked.

## Changed Files List
- [AndroidManifest.xml](file:///g:/Projects/Drishti/android/app/src/main/AndroidManifest.xml) (Added BIND_NOTIFICATION_LISTENER_SERVICE)
- [PrivacyManager.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/permissions/PrivacyManager.kt) (New)
- [DrishtiNotificationService.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/services/DrishtiNotificationService.kt) (New)
- [NotificationEventBus.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/telemetry/NotificationEventBus.kt) (New)
- [NotificationCollector.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/telemetry/collectors/NotificationCollector.kt) (New)
- [MediaPlaybackCollector.kt](file:///g:/Projects/Drishti/android/app/src/main/java/com/drishti/node/telemetry/collectors/MediaPlaybackCollector.kt) (Updated to consume Event Bus)

## Architecture Notes
- **Decoupled Processing**: The `DrishtiNotificationService` runs as a system-bound component and pipes raw maps into `NotificationEventBus`. The standard `TelemetryManager` polls this bus via `NotificationCollector` and `MediaPlaybackCollector`, applying standard throttling and delta updates.
- **Privacy Controls**: All notifications and media states pass through `PrivacyManager.isNotificationAllowed()` which matches against `blockedPackages` (e.g., `com.whatsapp`, `com.android.systemui`).
- **Media Session Tracking**: `MediaSessionManager` is bound to the notification listener, meaning we capture true media playback states (Spotify, YouTube) dynamically using `MediaController.Callback`, overcoming limitations of simple `AudioManager` hooks.

## Unresolved Issues
- `NotificationListenerService` requires manual user approval in the Android Settings -> Special Access menu. This is currently unaccounted for in the onboarding flow.
- Notification content (text/title) is intentionally dropped right now for max privacy; only `category` and `packageName` are kept.
