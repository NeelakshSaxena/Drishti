---
title: Rollback Notes
phase: Observability & Diagnostics Phase
generated: 2026-06-14T14:13:42+05:30
related:
  - [[Phase Report]]
---
# Rollback Notes

To rollback the observability framework, delete the `diagnostics` package, revert the `Thread.setDefaultUncaughtExceptionHandler` from `DrishtiApplication.kt`, and restore `MainActivity.kt` to its original minimal form.
