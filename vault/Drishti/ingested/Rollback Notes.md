---
title: Rollback Notes
phase: A8
generated: 2026-06-12T09:59:33+05:30
related:
  - [[Phase Report]]
---
# Rollback Notes

If the toolchain setup causes issues, remove the `toolchain/` directory and `android/local.properties`. 
If `build.gradle.kts` additions break functionality, they can be easily discarded by checking out `android/build.gradle.kts` and `android/app/build.gradle.kts` from the HEAD of this branch.
The removal of `setEnabled` in the Telemetry Collectors is fully compatible and should not be rolled back unless the `TelemetryCollector` interface reverts to a `fun` definition.
