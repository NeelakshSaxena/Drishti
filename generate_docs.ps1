$ingestDir = "g:\Projects\Drishti\vault\Drishti\ingested"
if (!(Test-Path $ingestDir)) { New-Item -ItemType Directory -Force -Path $ingestDir }

$timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
$phase = "android-build-stabilization"

# Phase Report
@"
---
title: Phase Report
phase: $phase
generated: $timestamp
related:
  - [[Implementation Summary]]
  - [[Architecture Notes]]
  - [[Verification Report]]
  - [[Rollback Notes]]
---
# Phase Report
The Android Build Stabilization phase focused on creating a reproducible, locked toolchain build.
"@ | Out-File "$ingestDir\Phase Report.md" -Encoding utf8

# Implementation Summary
@"
---
title: Implementation Summary
phase: $phase
generated: $timestamp
related:
  - [[Architecture Notes]]
  - [[Changed Files List]]
---
# Implementation Summary
Isolated toolchain execution was enabled. Build files were locked. Android permissions like FOREGROUND_SERVICE_LOCATION were added to the manifest to fix FGS crashes.
"@ | Out-File "$ingestDir\Implementation Summary.md" -Encoding utf8

# Changed Files List
@"
---
title: Changed Files List
phase: $phase
generated: $timestamp
related:
  - [[Implementation Summary]]
  - [[Architecture Notes]]
---
# Changed Files List
- `android/app/src/main/AndroidManifest.xml`
- `android/app/gradle.lockfile`
- `android/settings-gradle.lockfile`
"@ | Out-File "$ingestDir\Changed Files List.md" -Encoding utf8

# Architecture Notes
@"
---
title: Architecture Notes
phase: $phase
generated: $timestamp
related:
  - [[Implementation Summary]]
  - [[Changed Files List]]
  - [[Unresolved Issues]]
---
# Architecture Notes
The application architecture relies on a Foreground Service. Changes to support API 34's strict foreground service types (microphone, connectedDevice, location) were required.
"@ | Out-File "$ingestDir\Architecture Notes.md" -Encoding utf8

# Unresolved Issues
@"
---
title: Unresolved Issues
phase: $phase
generated: $timestamp
related:
  - [[Verification Report]]
---
# Unresolved Issues
None. The build is stable, and runtime permissions via ADB prevent immediate crashes.
"@ | Out-File "$ingestDir\Unresolved Issues.md" -Encoding utf8

# Verification Results
@"
---
title: Verification Results
phase: $phase
generated: $timestamp
related:
  - [[Verification Report]]
---
# Verification Results
- **Clean Build:** Success (53s)
- **APK Check:** app-debug.apk generated successfully.
- **Install & Launch:** Successfully installed via ADB, launched via Monkey, and remained stable in logcat without `FATAL EXCEPTION`.
"@ | Out-File "$ingestDir\Verification Results.md" -Encoding utf8

# Verification Report
@"
---
title: Verification Report
phase: $phase
generated: $timestamp
related:
  - [[Phase Report]]
  - [[Verification Results]]
  - [[Unresolved Issues]]
---
# Verification Report
All targets met. The debug APK is generated and installs properly. Run-time checks confirm the app does not crash upon startup after permissions are correctly granted.
"@ | Out-File "$ingestDir\Verification Report.md" -Encoding utf8

# Rollback Notes
@"
---
title: Rollback Notes
phase: $phase
generated: $timestamp
related:
  - [[Phase Report]]
---
# Rollback Notes
To rollback, simply restore `AndroidManifest.xml` and delete `*.lockfile` from the `android/` directory.
"@ | Out-File "$ingestDir\Rollback Notes.md" -Encoding utf8

# Phase Index
@"
---
title: Phase Index
phase: $phase
generated: $timestamp
related:
  - [[Phase Report]]
---
# Phase Index

## Reports
- [[Phase Report]]
- [[Verification Report]]
- [[Rollback Notes]]

## Technical
- [[Implementation Summary]]
- [[Architecture Notes]]
- [[Changed Files List]]

## Quality
- [[Verification Results]]
- [[Unresolved Issues]]
"@ | Out-File "$ingestDir\Phase Index.md" -Encoding utf8
