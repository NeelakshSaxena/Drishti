---\ntitle: Unresolved Issues\nphase: Phase_Accessibility\ngenerated: 2026-06-12T08:24:02Z\nrelated:\n  - [[Verification Report]]\n  - [[Changed Files List]]\n---\n\n# Unresolved Issues

- Enabling the accessibility service still requires a manual trip to the Android system settings by the user. An intent (`ACTION_ACCESSIBILITY_SETTINGS`) redirect needs to be added to the front-end UI.
- The recursive view extraction (`DrishtiAccessibilityService.kt`) drops deep nested node branches once 10 items are collected. Could lose important text depending on view hierarchy load order.

Related:
- [[Verification Report]]
- [[Changed Files List]]
