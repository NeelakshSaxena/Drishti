# PHASE M1 — FRONTEND ARCHITECTURE MIRRORING

## Objective

Use the existing Drishti frontend as the canonical UX/auth/backend reference for the Android app.

The Android app must:

- behave like frontend auth flow
- connect to same backend
- reuse endpoint patterns
- preserve visual identity
- support persistent “Always Remember” sessions
- support login/logout lifecycle
- preserve device pairing state

---

- backend url: https://drishti-walb.onrender.com
- supabase url in : backend/.env
- frontend url: https://drishti-phi.vercel.app/
- demo account email : neelaksh7.saxena@gmail.com
- demo account password : N33L4K8H@drishti

# Agentic Prompt

```text id="8lq4sx"
Analyze the existing Drishti frontend architecture and authentication flow.

Objectives:
- map frontend auth flow
- identify backend API endpoints
- identify websocket endpoints
- identify token/session handling
- identify persistence mechanisms
- identify UI/UX design language
- identify state management architecture
- identify theme/colors/layout systems

Also:
- inspect Stitch MCP exported screens
- identify reusable UI patterns
- identify login/dashboard/navigation layouts

DO NOT modify backend or frontend.

The Android app must:
- use frontend/backend contracts exactly
- visually align with frontend
- reuse backend auth/session behavior
- preserve existing APIs

Generate:
- API contract map
- auth lifecycle diagram
- websocket lifecycle diagram
- UI component mapping
- navigation flow graph
- Android adaptation recommendations

Store:
vault/Drishti/raw/frontend-analysis/
vault/Drishti/ingested/frontend/
vault/Drishti/phase-reports/M1_FRONTEND_ALIGNMENT.md
```

---

# Verification Checks

Agent must verify:

- login API identified
- refresh token flow identified
- websocket endpoints identified
- frontend persistence strategy understood
- Stitch screen mappings documented

---

# Stop Condition

STOP ONLY WHEN:

```text id="rwb5kn"
Agent can explain:
- exactly how frontend authenticates
- how sessions persist
- how websocket reconnect works
- how Android should mirror frontend behavior
```

---

# PHASE M2 — MOBILE UI SYSTEM GENERATION

## Objective

Create Android-native UI using:

- frontend as visual reference
- Stitch MCP screens as layout source

WITHOUT modifying frontend codebase.

---

# Agentic Prompt

```text id="g1u9vo"
Generate the complete Android UI layer for Drishti Node.

Use:
- existing frontend design language
- Stitch MCP exported screens
- frontend navigation patterns
- frontend typography/colors/layout spacing

Requirements:
- Android-native implementation
- Material 3
- responsive layouts
- dark mode support
- edge-to-edge support
- accessibility compliance

Screens required:
1. Splash screen
2. Login screen
3. Device pairing screen
4. Dashboard/home
5. Connection status screen
6. Telemetry status screen
7. Permission health screen
8. Always Remember settings
9. Diagnostics screen
10. Logout/settings screen

UI must display:
- backend connection status
- websocket health
- heartbeat timestamps
- device online/offline
- telemetry indicators
- auth/session state

Implement:
- navigation graph
- ViewModels
- state containers
- loading/error states
- offline states
- reconnect banners

DO NOT create mock APIs.
Use real backend contracts.
```

---

# Required Android Modules

```text id="mjlwmv"
app/ui/
app/navigation/
app/theme/
app/screens/
app/components/
```

---

# Verification Checks

- all screens render
- navigation works
- dark mode functional
- no UI crashes
- responsive on multiple screen sizes

---

# Stop Condition

STOP ONLY WHEN:

```text id="y7brha"
The Android app visually matches Drishti frontend identity and all required screens function.
```

---

# PHASE M3 — LOGIN + SESSION PERSISTENCE

## Objective

Implement real authentication.

---

# Agentic Prompt

```text id="w3z2kh"
Implement Android authentication identical to frontend behavior.

Requirements:
- same backend login APIs
- same JWT/session logic
- secure token persistence
- refresh token handling
- automatic reauthentication
- logout support

Credentials test account:
email:
neelaksh7.saxena@gmail.com

password:
N33L4K8H@drishti

Features:
- login screen
- remember me
- ALWAYS REMEMBER mode
- silent session restore
- reconnect after app restart
- reconnect after reboot

Always Remember mode:
- persist encrypted credentials/token
- auto-login on app open
- auto-reconnect websocket
- maintain device registration state

Security:
- EncryptedSharedPreferences
- token expiry validation
- refresh token rotation
- no plaintext logging

DO NOT hardcode credentials in production builds.
Use only for automated testing validation.
```

---

# Verification Checks

- login succeeds
- token refresh works
- app relaunch restores session
- reboot restores session
- logout clears session properly

---

# Stop Condition

STOP ONLY WHEN:

```text id="kgl2hk"
The app:
- logs in successfully
- reconnects automatically
- restores session silently
- survives reboot without re-login
```

---

# PHASE M4 — BACKEND CONNECTION MIRRORING

## Objective

Android behaves exactly like frontend networking layer.

---

# Agentic Prompt

```text id="prj16r"
Mirror frontend backend connectivity inside Android app.

Requirements:
- same API base URL logic
- same websocket endpoint logic
- same auth headers
- same reconnect strategy
- same heartbeat lifecycle

Implement:
- Retrofit/Ktor API layer
- websocket lifecycle manager
- auth interceptors
- refresh interceptors
- offline queueing
- exponential reconnect

UI integration:
- live connection indicators
- websocket status display
- backend ping metrics
- reconnect banners

DO NOT create alternate backend behavior.
Android must behave as another official client.
```

---

# Verification Checks

- websocket connects
- API requests succeed
- auth headers valid
- reconnect works
- backend sees device properly

---

# Stop Condition

STOP ONLY WHEN:

```text id="1x0hkw"
Android app successfully behaves as a fully authenticated realtime Drishti client.
```

---

# PHASE M5 — DEVICE REGISTRATION + PHONE LINKING

## Objective

Phone becomes registered Drishti node.

---

# Agentic Prompt

```text id="v8b9cm"
Implement Android device registration and linking.

Requirements:
- register Android device with backend
- sync capabilities
- generate persistent device_id
- maintain device state
- reconnect after restart

Device lifecycle:
1. login
2. register device
3. establish websocket
4. sync capabilities
5. begin telemetry

Display:
- device name
- device status
- last heartbeat
- backend connection state

Implement:
- registration retries
- duplicate device detection
- stale device cleanup
```

---

# Verification Checks

- device visible in backend
- reconnect preserves identity
- duplicate registrations prevented
- heartbeat visible

---

# Stop Condition

STOP ONLY WHEN:

```text id="6f1d9l"
The Android phone is permanently recognized as a Drishti device node.
```

---

# PHASE M6 — ADB INSTALLATION + REINSTALLATION PIPELINE

## Objective

Fully automated deployment/testing loop.

---

# Agentic Prompt

```text id="1mjlwm"
Create automated ADB deployment pipeline for Drishti Android app.

Requirements:
- detect connected devices
- uninstall existing app if installed
- reinstall latest APK
- clear stale data if requested
- launch app automatically
- capture logcat
- validate startup success

Implement scripts for:
- Windows
- Linux/macOS

Flow:
1. detect adb device
2. uninstall existing package
3. install fresh APK
4. grant required permissions
5. launch app
6. verify foreground activity
7. monitor crashes/logcat

Generate:
- install scripts
- troubleshooting guide
- adb diagnostics
- startup validation logs
```

---

# Required Outputs

```text id="vzjlwm"
scripts/install-debug.ps1
scripts/install-debug.sh
scripts/adb-diagnostics/
```

---

# Verification Checks

- uninstall succeeds
- reinstall succeeds
- app launches
- permissions granted
- no startup crash

---

# Stop Condition

STOP ONLY WHEN:

```text id="1a8xsm"
A single command can fully redeploy and relaunch the Android app on a connected phone.
```

---

# PHASE M7 — PERMISSION + ALWAYS-ON CONFIGURATION

## Objective

Configure Android for persistent operation.

---

# Agentic Prompt

```text id="m0v1zc"
Implement Android persistent-operation configuration flow.

Requirements:
- battery optimization exclusion flow
- notification listener onboarding
- accessibility onboarding
- microphone permissions
- location permissions
- boot persistence

Add:
- permission health dashboard
- onboarding walkthrough
- OEM battery optimization guidance

Always Remember mode must:
- survive reboot
- restore websocket
- restore telemetry
- restore login session
```

---

# Verification Checks

- reboot recovery works
- services restart automatically
- permissions persist
- telemetry resumes

---

# Stop Condition

STOP ONLY WHEN:

```text id="jlwmf4"
The Android app can recover fully after reboot without user intervention.
```

---

# PHASE M8 — END-TO-END LIVE VALIDATION

## Objective

Validate entire live stack.

---

# Agentic Prompt

```text id="jlwmt9"
Perform full live integration validation between:
- Android app
- Drishti backend
- frontend-compatible APIs
- websocket gateway
- telemetry pipeline

Validate:
- login
- session persistence
- websocket lifecycle
- telemetry ingestion
- reconnect behavior
- reboot recovery
- Always Remember mode
- ADB deployment
- notification ingestion
- media ingestion
- diagnostics export

Generate:
- FULL_SYSTEM_VALIDATION.md
- CONNECTION_TRACE.md
- DEVICE_HEALTH_REPORT.md
- FAILURE_REPORTS.md

Store all outputs in:
vault/Drishti/verification/live/
```

---

# Final Verification Matrix

| Capability               | Required |
| ------------------------ | -------- |
| Login screen works       | YES      |
| Frontend-compatible auth | YES      |
| Session restore          | YES      |
| Always Remember mode     | YES      |
| Websocket stable         | YES      |
| Backend connection       | YES      |
| Device registration      | YES      |
| Telemetry active         | YES      |
| Reboot recovery          | YES      |
| ADB reinstall pipeline   | YES      |

---

# FINAL STOP CONDITION

STOP ONLY WHEN:

```text id="jlwmqa"
A real Android phone can:
- install via ADB
- login successfully
- remain permanently authenticated
- reconnect automatically
- survive reboot
- connect to backend exactly like frontend
- function unattended as a persistent Drishti node
```
