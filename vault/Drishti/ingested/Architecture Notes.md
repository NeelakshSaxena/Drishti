---\ntitle: Architecture Notes\nphase: Phase_Accessibility\ngenerated: 2026-06-12T08:24:02Z\nrelated:\n  - [[Implementation Summary]]\n  - [[Changed Files List]]\n  - [[Phase Report]]\n---\n\n# Architecture Notes

- **DrishtiAccessibilityService**: Handles the system callbacks. Employs a 2000ms throttle before recursively traversing the `AccessibilityNodeInfo` tree to pull out `node.text` and `node.contentDescription`.
- **Event Bus Bridging**: Pushes custom `ui_text_extracted` and `foreground_app` mapped packets directly to `NotificationEventBus`.
- **AccessibilityCollector**: Filters the Event Bus for a11y types. Note that this collector sets `isEnabled = false` by default, satisfying the "disabled by default" requirement.
- **Privacy Check**: Bypasses the text traversal if the `packageName` matches the blocklist inside `PrivacyManager`. No code performs `performAction(ACTION_CLICK)`, meaning there is zero auto-clicking.

Related:
- [[Implementation Summary]]
- [[Changed Files List]]
- [[Phase Report]]
