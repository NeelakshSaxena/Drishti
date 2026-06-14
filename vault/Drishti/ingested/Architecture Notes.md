---
title: Architecture Notes
phase: Observability & Diagnostics Phase
generated: 2026-06-14T14:13:42+05:30
related:
  - [[Implementation Summary]]
  - [[Changed Files List]]
  - [[Unresolved Issues]]
  - [[Phase Report]]
---
# Architecture Notes

- Diagnostics state is held as singletons (`DiagnosticsManager`, `DiagnosticsLogger`) to ensure uniform capture across all Application background workers and foreground UI surfaces.
- PII redaction happens dynamically at logging call sites before storing in memory or exporting to disk.
