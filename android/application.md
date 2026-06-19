# PHASE A8 — BUILD SYSTEM STABILIZATION was completed

This is the MOST important missing phase.

---

# Agentic Prompt

```text id="k8f0av"
Analyze and stabilize the Android build system for Drishti Node.

Objectives:
- produce reproducible APK builds
- eliminate Gradle instability
- resolve dependency/version conflicts
- ensure Android SDK/toolchain consistency

Tasks:
1. Inspect:
   - Gradle files
   - Kotlin versions
   - AGP versions
   - dependency graph
   - manifest merges
   - duplicate resources
   - kapt/hilt setup
   - protobuf/transitive conflicts

2. Resolve:
   - incompatible dependencies
   - namespace conflicts
   - minSdk/targetSdk issues
   - Java/Kotlin toolchain mismatches
   - duplicate META-INF collisions
   - coroutine incompatibilities

3. Verify:
   - clean builds
   - incremental builds
   - deterministic outputs
   - debug APK generation

4. Add:
   - version catalogs if missing
   - dependency locking
   - build variants
   - lint configs
   - proguard/r8 configs

5. Generate:
   - BUILD_STATUS.md
   - dependency graph
   - unresolved blockers
   - exact APK output path

Store all outputs in:
vault/Drishti/raw/build/
vault/Drishti/verification/build/
```

---

# Verification Checks

Agent MUST verify:

## Build

- `./gradlew assembleDebug`
- `./gradlew clean assembleDebug`

## Toolchain

- no version mismatch
- no duplicate class errors
- no unresolved manifests

## Output

- APK generated successfully
- APK size reasonable
- no corrupted artifact

---

# Stop Condition

STOP ONLY WHEN:

```text id="ewslpn"
A reproducible debug APK exists and:
- installs successfully
- launches successfully
- does not immediately crash
```

---

# PHASE A9 — CI/CD APK PIPELINE

Now automate builds.

---

# Agentic Prompt

```text id="ofv2ta"
Create a production-grade Android CI/CD pipeline for Drishti Node.

Requirements:
- GitHub Actions based
- deterministic builds
- APK artifact uploads
- cache optimization
- parallel lint/test/build stages

Pipeline must:
1. validate formatting
2. run lint
3. run unit tests
4. assemble debug APK
5. assemble release APK
6. upload artifacts
7. generate checksums
8. publish build metadata

Add:
- dependency cache
- Gradle cache
- JDK setup
- Android SDK setup
- workflow badges

Artifacts:
- debug APK
- release APK
- mapping.txt
- build reports

Store workflow reports in:
vault/Drishti/raw/ci/
vault/Drishti/verification/ci/
```

---

# Required Repo Changes

```text id="l2p1wf"
.github/workflows/android-build.yml
.github/workflows/android-release.yml
```

---

# Verification Checks

- workflows trigger correctly
- artifacts uploaded
- build cache works
- release pipeline succeeds

---

# Stop Condition

STOP ONLY WHEN:

```text id="6yc61t"
GitHub Actions automatically produces downloadable APK artifacts on push.
```

---

# PHASE A10 — EMULATOR VALIDATION

Most AI agents skip this.
Do NOT skip it.

---

# Agentic Prompt

```text id="upivrf"
Perform emulator-based validation for Drishti Node.

Requirements:
- Android Emulator testing
- API 26+
- API 34 validation
- background service validation
- websocket stability validation

Validate:
- app install
- foreground service startup
- websocket connection
- reconnect behavior
- permission flow
- notification listener
- accessibility service
- wake-word initialization

Capture:
- logcat
- ANRs
- crashes
- memory usage
- battery estimates

Store:
vault/Drishti/raw/emulator/
vault/Drishti/verification/emulator/
```

---

# Verification Checks

- app survives backgrounding
- reconnect works
- no startup crash
- services initialize correctly

---

# Stop Condition

STOP ONLY WHEN:

```text id="x4g6l9"
App remains stable on emulator for:
- 1 hour idle
- 30 reconnect cycles
- repeated screen lock/unlock
```

---

# PHASE A11 — PHYSICAL DEVICE VALIDATION

THIS is where reality appears 😭

OEM battery optimization hell begins here.

---

# Agentic Prompt

```text id="7mm3g8"
Perform physical Android device validation for Drishti Node.

Validate on:
- Pixel device preferred
- Samsung if available
- Android 12+
- Android 14+

Validate:
- foreground service persistence
- OEM battery optimization survival
- websocket uptime
- telemetry accuracy
- reboot recovery
- wake-word reliability
- notification listener stability

Measure:
- CPU usage
- RAM usage
- battery drain
- network usage

Generate:
- DEVICE_VALIDATION_REPORT.md
- BATTERY_PROFILE.md
- OEM_COMPATIBILITY.md
```

---

# Verification Checks

- survives reboot
- survives overnight idle
- survives WiFi/mobile switching
- telemetry remains accurate

---

# Stop Condition

STOP ONLY WHEN:

```text id="b6x4k9"
A real Android device remains connected and functional for 24 hours unattended.
```

---

# PHASE A12 — RELEASE PACKAGING

Now create proper distributable APKs.

---

# Agentic Prompt

```text id="jlwmga"
Prepare production-ready APK release packaging.

Requirements:
- signed APKs
- versioned outputs
- semantic versioning
- changelog generation
- release notes
- checksum generation

Create:
- release signing config
- keystore handling docs
- install instructions
- sideload guide

Generate:
- universal APK
- optional split APKs
- release metadata
- SHA256 hashes

Store:
vault/Drishti/releases/
```

---

# Verification Checks

- signed APK installs
- signatures verify
- versionCode increments correctly
- release notes generated

---

# Stop Condition

STOP ONLY WHEN:

```text id="bty1oq"
A signed production APK exists and:
- installs cleanly
- survives upgrade
- connects successfully to backend
```

---

# SUPER IMPORTANT ADDITION

You ALSO need this:

# PHASE A13 — RUNTIME OBSERVABILITY

Because otherwise debugging this system later becomes pain.

---

# Agentic Prompt

```text id="t3lme9"
Implement observability and diagnostics for Drishti Node.

Add:
- structured logs
- websocket diagnostics
- telemetry counters
- reconnect metrics
- battery metrics
- crash capture
- local debug dashboard

Create:
- diagnostics export
- health report generator
- connection timeline
- telemetry throughput stats

All logs must support privacy-safe redaction.
```

---

# Verification Checks

- logs structured correctly
- diagnostics export works
- PII redaction works

---

# Stop Condition

STOP ONLY WHEN:

- failures can be diagnosed from exported reports alone

---

# MOST IMPORTANT PROMPT ADDITION

Add THIS to every future build-related prompt:

```text id="3v1ol5"
Do NOT claim success based solely on compilation.

Success requires:
- actual APK artifact generation
- installation validation
- runtime validation
- log verification
- crash verification

If APK generation fails:
- identify exact failing task
- isolate root cause
- propose minimal fix
- retry incrementally

Never skip verification steps.
```

---

# FINAL RESULT

After these phases you’ll have:

```text id="1uoqe2"
Drishti Core
    ↕
Realtime Device Gateway
    ↕
Android Sensor Node
    ↕
Telemetry + Context
    ↕
Persistent Memory
    ↕
Agent Runtime
```

AND:

```text id="5nld0v"
- reproducible APKs
- CI pipelines
- installable builds
- observable runtime
- persistent engineering memory
- vault traceability
- deployable architecture
```

Which is the difference between:

> “AI-generated project”

and

> “real maintainable system.”
