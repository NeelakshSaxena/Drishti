---\ntitle: Rollback Notes\nphase: Phase_Accessibility\ngenerated: 2026-06-12T08:24:02Z\nrelated:\n  - [[Phase Report]]\n---\n\n# Rollback Notes

Rollback Procedure:
1. Revert `AndroidManifest.xml` to remove the `DrishtiAccessibilityService`.
2. Delete `android/app/src/main/res/xml/accessibility_service_config.xml`.
3. Delete `android/app/src/main/java/com/drishti/node/services/DrishtiAccessibilityService.kt`.
4. Delete `android/app/src/main/java/com/drishti/node/telemetry/collectors/AccessibilityCollector.kt`.
5. Remove injection in `AppModule.kt`.

Related:
- [[Phase Report]]
