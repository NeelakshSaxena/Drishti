---
title: Sideload Guide
phase: Release Packaging Phase
generated: 2026-06-14T13:47:51+05:30
---
# Sideload Guide (via ADB)

1. Connect device and enable USB Debugging.
2. Verify connection: `adb devices`
3. Install the universal APK:
   `adb install -r app-release-1.1.0.apk`
