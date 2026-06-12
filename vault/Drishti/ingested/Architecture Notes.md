---
title: Architecture Notes
phase: A8
generated: 2026-06-12T09:59:33+05:30
related:
  - [[Implementation Summary]]
  - [[Changed Files List]]
  - [[UNRESOLVED_BLOCKERS]]
  - [[Phase Report]]
---
# Architecture Notes

The Android Node follows standard Android best practices:
- **Build System**: Kotlin DSL (`*.gradle.kts`) with version pinning for deterministic builds.
- **Dependency Injection**: Hilt is used natively via `DrishtiApplication` and Worker Factories.
- **Resource Management**: Extracted missing resources (themes, icons) to satisfy AAPT linkings.
- **Telemetry Configuration**: The collectors utilize Kotlin Flows instead of JVM-specific setter functions, simplifying the interface and resolving JVM signature collisions on `isEnabled`.