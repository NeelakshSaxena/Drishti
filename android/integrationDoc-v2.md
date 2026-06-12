# MASTER ARCHITECTURE ADDITIONS

You’ll add:

```text id="n6h2ks"
/services/device-gateway
/services/device-memory-ingestion
/apps/drishti-node-android
/shared/device-protocol
/vault/Drishti/
```

---

# REQUIRED VAULT STRUCTURE

This becomes the “persistent engineering memory”.

```text id="j9ub5m"
vault/Drishti/
│
├── raw/
│   ├── prompts/
│   ├── outputs/
│   ├── logs/
│   ├── traces/
│   └── experiments/
│
├── ingested/
│   ├── architecture/
│   ├── protocols/
│   ├── telemetry/
│   ├── android/
│   ├── backend/
│   └── memory/
│
├── phase-reports/
├── verification/
├── failures/
├── decisions/
└── roadmap/
```

---

# VERY IMPORTANT RULE

At END of EVERY PHASE:

Agent MUST:

1. Store RAW outputs
2. Store VERIFIED summaries
3. Store architecture deltas
4. Store failure reports
5. Update roadmap status

---

# STANDARD PHASE MEMORY CONTRACT

Every phase ends with:

```text id="1e61c1"
vault/Drishti/phase-reports/PHASE_X.md
```

AND:

```text id="g7tr7q"
vault/Drishti/verification/PHASE_X_VERIFICATION.md
```

AND:

```text id="r3cmtz"
vault/Drishti/decisions/PHASE_X_DECISIONS.md
```

---

# GLOBAL AGENT RULESET

Add THIS to EVERY Claude/Codex prompt:

```text id="w2f3m5"
At the end of this phase:

1. Generate:
   - implementation summary
   - changed files list
   - architecture notes
   - unresolved issues
   - verification results

2. Store RAW artifacts in:
   vault/Drishti/raw/

3. Store INGESTED summaries in:
   vault/Drishti/ingested/

4. Create:
   phase report
   verification report
   rollback notes

5. Do NOT continue if stop conditions fail.
```

---

# DRISHTI CORE CHANGES

Now specifically for YOUR backend.

---

# PHASE D1 — Analyze Existing Drishti Architecture

FIRST agents must understand your current system.

---

# Agentic Prompt

```text id="n71ivq"
Analyze the existing Drishti repository architecture.

Tasks:
- map backend architecture
- identify memory systems
- identify agent runtime
- identify websocket/event systems
- identify auth systems
- identify plugin/service patterns
- identify context ingestion flow
- identify persistence/database layers

Generate:
- architecture graph
- service dependency graph
- event flow map
- extension points for device integration

Store:
- raw scan outputs
- repo structure
- dependency inventory
- architecture summaries

Output into:
vault/Drishti/raw/repo-analysis/
vault/Drishti/ingested/architecture/

Do NOT modify code yet.
```

---

# Verification Checks

- all major modules identified
- backend startup flow mapped
- event/memory architecture understood
- extension points documented

---

# Stop Condition

STOP ONLY WHEN:

```text id="fjwg5q"
Agent can explain:
- how memory flows through Drishti
- where device events should enter
- where commands should originate
- where authentication hooks belong
```

---

# PHASE D2 — Introduce Device Domain Layer

You need a NEW bounded context.

---

# Agentic Prompt

```text id="p9ohh7"
Add a new bounded context to Drishti:

Device Domain

Responsibilities:
- device registry
- device lifecycle
- capabilities
- device state
- command routing
- telemetry ingestion

Create:
- device models
- device repository interfaces
- capability schemas
- heartbeat tracking
- device state cache

Integrate cleanly into existing Drishti architecture.

Do NOT tightly couple Android logic into cognition layers.

All device communication must remain abstract.
```

---

# Required Codebase Changes

Likely additions:

```text id="g3f3hb"
/core/device/
/models/device/
/services/device/
/events/device/
/schemas/device/
```

---

# Verification Checks

- device domain isolated
- no circular dependencies
- models validate correctly
- existing systems unaffected

---

# Stop Condition

STOP ONLY WHEN:

- device subsystem compiles
- existing tests pass
- device lifecycle test passes

---

# PHASE D3 — Build Device Gateway Service

This becomes your realtime layer.

---

# Agentic Prompt

```text id="upm1ho"
Implement Drishti Device Gateway Service.

Requirements:
- websocket-based
- async
- scalable
- reconnect-safe
- heartbeat-aware

Responsibilities:
- maintain device sessions
- authenticate devices
- receive telemetry
- dispatch commands
- maintain online/offline state

Use existing Drishti patterns where possible.

Add:
- structured logging
- metrics
- tracing hooks
- Redis integration if architecture already supports it
```

---

# Required Repo Changes

```text id="r0jzjlwm"
/services/device-gateway/
/gateway/ws/
/gateway/auth/
/gateway/session/
```

---

# Verification Checks

- multiple devices connect
- reconnect works
- invalid auth rejected
- sessions cleaned correctly

---

# Stop Condition

STOP ONLY WHEN:

- 24h websocket stability test passes
- reconnect verified
- no session leaks

---

# PHASE D4 — Context Ingestion Integration

This is where Android becomes “memory”.

---

# Agentic Prompt

```text id="v3hm9x"
Integrate device telemetry into Drishti context/memory pipeline.

Convert telemetry into:
- contextual memory events
- state updates
- temporal signals

Support:
- battery
- location
- app usage
- notifications
- media state
- connectivity

Requirements:
- deduplication
- timestamp normalization
- event confidence scoring
- context tagging
- source attribution

Device telemetry must become queryable by agents.
```

---

# Required Repo Changes

```text id="vf8u3l"
/memory/device/
/context/device/
/ingestion/device/
/pipelines/device/
```

---

# Verification Checks

- telemetry enters memory pipeline
- duplicate suppression works
- malformed packets rejected
- queries return latest device state

---

# Stop Condition

STOP ONLY WHEN:

- agents can query device state reliably
- ingestion survives malformed data
- replay pipeline works

---

# PHASE D5 — Device Command System

Now Drishti can ACT.

---

# Agentic Prompt

```text id="23by3m"
Implement device command dispatch system.

Supported commands:
- speak_text
- vibrate
- request_snapshot
- sync_now
- start_voice_capture
- notification_push

Requirements:
- ACK support
- retries
- expiration
- offline queue
- signed commands

Integrate into existing Drishti agent execution flow.
```

---

# Required Repo Changes

```text id="m5gnba"
/commands/device/
/dispatch/device/
/queue/device/
```

---

# Verification Checks

- commands ACK properly
- retries work
- offline queue survives restart
- expired commands removed

---

# Stop Condition

STOP ONLY WHEN:

- command lifecycle stable
- replay-safe
- duplicate execution prevented

---

# ANDROID APP PHASES

Now the Android side.

---

# PHASE A1 — Bootstrap Android Node

---

# Agentic Prompt

```text id="q1q2e2"
Create Android application:

Drishti Node

Requirements:
- Kotlin
- Clean architecture
- foreground service
- websocket manager
- reconnect logic
- Hilt DI
- WorkManager fallback
- modular collectors

Structure:
- core/
- telemetry/
- networking/
- services/
- permissions/
- storage/

Implement:
- websocket connection
- heartbeat
- auth token handling
- reconnect strategy
- structured logs
```

---

# Required Vault Outputs

```text id="81n2r4"
vault/Drishti/ingested/android/bootstrap.md
vault/Drishti/raw/android/build-logs/
```

---

# Verification Checks

- survives screen off
- reconnects after airplane mode
- no foreground service crashes
- heartbeat stable

---

# Stop Condition

STOP ONLY WHEN:

- stable for 30 mins idle
- reconnect tested
- battery drain acceptable

---

# PHASE A2 — Telemetry Collection Framework

---

# Agentic Prompt

```text id="n9cx8m"
Implement telemetry framework.

Collectors:
- battery
- charging
- network
- bluetooth
- screen state
- media playback
- location

Requirements:
- modular collectors
- event throttling
- batching
- delta updates
- permissions-aware
- low battery usage
```

---

# Verification Checks

- telemetry packets valid
- collectors independently toggleable
- throttling functional

---

# Stop Condition

STOP ONLY WHEN:

- backend receives stable telemetry
- battery drain acceptable
- no duplicate storms

---

# PHASE A3 — Notification + Media Layer

---

# Agentic Prompt

```text id="qbr0x8"
Add notification listener and media session integration.

Requirements:
- notification filtering
- media metadata extraction
- privacy controls
- configurable allowlists/blocklists

Capture:
- source app
- category
- timestamp
- playback metadata
```

---

# Verification Checks

- notifications captured
- sensitive notifications filtered
- media tracking stable

---

# Stop Condition

STOP ONLY WHEN:

- backend receives clean events
- no notification spam
- filters verified

---

# PHASE A4 — Accessibility Context Layer

---

# Agentic Prompt

```text id="m7n9tm"
Implement optional accessibility observation module.

Capabilities:
- foreground app tracking
- UI text extraction
- passive interaction inference

Requirements:
- disabled by default
- strict throttling
- no auto-clicking
- privacy-safe
```

---

# Verification Checks

- no ANRs
- accessibility service stable
- extraction rate limited

---

# Stop Condition

STOP ONLY WHEN:

- 1hr stability test passes
- CPU usage acceptable

---

# PHASE A5 — Voice Integration

---

# Agentic Prompt

```text id="z9w2vv"
Implement wake-word and audio streaming subsystem.

Requirements:
- local wake-word
- websocket streaming
- VAD
- Whisper-compatible chunks
- low idle battery usage

Do NOT continuously stream audio.
```

---

# Verification Checks

- wake-word offline works
- audio chunks valid
- idle drain acceptable

---

# Stop Condition

STOP ONLY WHEN:

- stable wake-word activation
- backend receives audio correctly

---

# PHASE A6 — Provisioning + Pairing

---

# Agentic Prompt

```text id="sp82lg"
Implement device onboarding flow.

Features:
- QR pairing
- capability sync
- permission health checks
- device naming
- credential exchange

Backend must:
- register devices
- issue credentials
- revoke devices
```

---

# Verification Checks

- QR pairing works
- revoked devices disconnect
- capability sync accurate

---

# Stop Condition

STOP ONLY WHEN:

- onboarding complete end-to-end
- credential persistence verified

---

# PHASE A7 — Security Hardening

---

# Agentic Prompt

```text id="8kwl0y"
Implement production-grade security.

Requirements:
- TLS/WSS only
- signed packets
- replay protection
- encrypted storage
- token rotation
- optional certificate pinning
```

---

# Verification Checks

- invalid signatures rejected
- secrets not logged
- expired tokens rejected

---

# Stop Condition

STOP ONLY WHEN:

- all traffic encrypted
- auth rotation stable

---

# FINAL MASTER PHASE

---

# PHASE X — Full System Validation

---

# Agentic Prompt

```text id="ebvvja"
Perform full-system integration validation.

Validate:
- Android device pairing
- websocket stability
- telemetry ingestion
- memory integration
- command dispatch
- reconnect behavior
- reboot persistence
- offline recovery
- multi-device scaling

Generate:
- architecture report
- performance report
- battery report
- failure analysis
- unresolved risks
```

---

# Final Verification Matrix

The system must prove:

| Capability                 | Required |
| -------------------------- | -------- |
| Realtime connection        | YES      |
| Offline recovery           | YES      |
| Telemetry ingestion        | YES      |
| Context memory integration | YES      |
| Command dispatch           | YES      |
| Device auth                | YES      |
| Multi-device support       | YES      |
| Battery acceptable         | YES      |
| Reboot survival            | YES      |

---

# FINAL STOP CONDITION

STOP ONLY WHEN:

```text id="u6vdl0"
A real Android device can:

- pair with Drishti
- remain connected 24h
- stream telemetry
- receive commands
- recover from disconnects
- survive reboot
- operate unattended
```

AND:

```text id="pmt0hs"
Drishti agents can:
- query live device context
- reason over telemetry
- dispatch actions
- maintain persistent device memory
```
