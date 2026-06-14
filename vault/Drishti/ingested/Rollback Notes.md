---
title: Rollback Notes
phase: Build Stabilization Phase
generated: 2026-06-14T13:31:54+05:30
related:
  - [[Phase Report]]
---
# Rollback Notes

If the GitHub Actions workflows cause issues, remove `.github/workflows/android-build.yml` and `.github/workflows/android-release.yml`. The project will fall back to local builds only.
