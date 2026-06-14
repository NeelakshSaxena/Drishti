---
title: Rollback Notes
phase: Release Packaging Phase
generated: 2026-06-14T13:47:51+05:30
related:
  - [[Phase Report]]
---
# Rollback Notes

If the production key is ever compromised, increment the `versionCode`, generate a new keystore, update the `signingConfigs` alias, and issue an immediate patch release. To rollback the code changes made in this phase, revert `app/build.gradle.kts` to its previous `versionCode` and remove the `release` signature block.
