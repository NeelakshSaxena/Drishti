---
title: Unresolved Issues
phase: Release Packaging Phase
generated: 2026-06-14T13:47:51+05:30
related:
  - [[Verification Report]]
  - [[Architecture Notes]]
---
# Unresolved Issues

- Release keystore parameters (`storePassword`, `keyPassword`) are hardcoded in `build.gradle.kts` temporarily. For full CI/CD deployment, they must be migrated to `System.getenv("KEYSTORE_PASSWORD")` and injected via GitHub Actions secrets.
