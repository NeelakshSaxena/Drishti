# Existing Drishti Codebase Changes

You’ll likely need these major additions:

| Layer          | Change                      |
| -------------- | --------------------------- |
| Core Runtime   | Device abstraction layer    |
| Memory System  | Device-context ingestion    |
| Event Bus      | Telemetry event schema      |
| Agent Layer    | Device command tools        |
| API Layer      | WebSocket gateway           |
| Identity Layer | Device auth/provisioning    |
| Plugin System  | Capability registration     |
| Context Engine | Live device-state awareness |

---

# GLOBAL ARCHITECTURE TARGET

```text id="e9clyq"
┌─────────────────────┐
│ Android Node Client │
└─────────┬───────────┘
          │ WSS
┌─────────▼───────────┐
│ Device Gateway      │
└─────────┬───────────┘
          │
┌─────────▼───────────┐
│ Drishti Event Bus   │
└─────────┬───────────┘
          │
 ┌────────▼─────────┐
 │ Memory + Context │
 └────────┬─────────┘
          │
 ┌────────▼─────────┐
 │ Agent Runtime    │
 └──────────────────┘
```

---

# BACKEND REFACTOR PHASES

---

# PHASE D1 — Repository Architectural Audit

## Purpose

Force agent to understand current Drishti structure before modifications.

This prevents:

- duplicate systems
- architectural drift
- hardcoded Android logic
- spaghetti integrations

---

# Agentic Prompt

```text id="bxmopq"
Audit the entire Drishti repository architecture before implementing Android node support.

Tasks:
1. Identify:
   - runtime entrypoints
   - event systems
   - memory/context systems
   - API layers
   - plugin architecture
   - agent orchestration
   - websocket support
   - auth systems
   - state persistence
   - queue/event infrastructure

2. Produce:
   - dependency graph
   - runtime lifecycle map
   - module interaction map
   - extension points
   - technical debt risks
   - coupling risks

3. Identify ideal insertion points for:
   - device gateway
   - telemetry ingestion
   - command dispatch
   - live context updates
   - device capability registration

Constraints:
- Do NOT modify code yet
- Do NOT generate speculative abstractions
- Prefer existing patterns already present in repository

Output:
- markdown architecture report
- proposed integration map
- risk assessment
- recommended refactor list
```

---

# Verification Checks

- Entire repo indexed
- Entry points identified
- Runtime lifecycle understood
- Existing abstractions reused
- No speculative architecture invented

---

# Stop Condition

STOP ONLY WHEN:

- integration points are clearly mapped
- all relevant services identified
- Android integration plan references EXISTING repository structures

---

# PHASE D2 — Device Abstraction Layer

This is the MOST important backend phase.

Without this, Android support becomes hardcoded chaos.

---

# Agentic Prompt

```text id="jcgpbf"
Create a generalized device abstraction layer for Drishti.

Requirements:
- devices must become first-class runtime entities
- architecture must support:
    - Android
    - desktop nodes
    - browser nodes
    - IoT nodes
    - future wearable nodes

Create:
- Device interface
- Capability interface
- Device registry
- Session abstraction
- Transport abstraction
- Presence tracking
- Device state model

Capabilities examples:
- microphone
- notifications
- location
- screen
- audio_output
- camera

Requirements:
- transport-agnostic
- async-safe
- modular
- serializable
- event-driven

Do NOT hardcode Android-specific assumptions.
```

---

# Verification Checks

- Devices can register dynamically
- Capability negotiation works
- Device state serializes cleanly
- Multiple transport types possible

---

# Stop Condition

STOP ONLY WHEN:

- Android implementation can plug into abstraction cleanly
- no Android-specific logic leaks into core interfaces

---

# PHASE D3 — Event Bus Upgrade

Your earlier Drishti architecture implied:

- distributed cognition
- modular nodes
- pluggable agents

So the event bus must evolve now.

---

# Agentic Prompt

```text id="p5rdpb"
Refactor Drishti event infrastructure to support realtime distributed node telemetry.

Requirements:
- typed event schemas
- replay support
- deduplication
- source attribution
- event versioning
- async event routing

Add support for:
- device telemetry events
- command acknowledgement events
- realtime presence events
- capability updates

Requirements:
- low latency
- horizontally scalable
- future Kafka compatibility
- Redis-compatible initially

Do NOT tightly couple events to Android structures.
```

---

# Verification Checks

- Events replay safely
- Schemas validate
- Deduplication works
- Source attribution preserved
- High throughput stable

---

# Stop Condition

STOP ONLY WHEN:

- Android telemetry can traverse event bus safely
- memory system consumes events correctly

---

# PHASE D4 — Context/Memory Integration

This phase upgrades Drishti cognition itself.

---

# Agentic Prompt

```text id="t8lnt0"
Integrate live device telemetry into Drishti memory/context engine.

Requirements:
- telemetry becomes contextual memory
- support temporal querying
- support latest-state querying
- support event-history querying

Examples:
- current battery state
- recent locations
- active media session
- device availability

Create:
- state reducers
- temporal aggregators
- context indexing
- short-term realtime state cache

Requirements:
- avoid memory flooding
- configurable retention
- deduplicated updates
```

---

# Verification Checks

- latest state queries work
- historical queries work
- duplicate telemetry suppressed
- memory pressure stable

---

# Stop Condition

STOP ONLY WHEN:

- agents can query live Android state naturally

Example:

```text id="n6p8fc"
"What music is playing on Neelaksh's phone?"
```

---

# PHASE D5 — Agent Tool Integration

Now agents can USE devices.

---

# Agentic Prompt

```text id="g5m5t8"
Expose device interactions as agent tools/actions.

Requirements:
- tools dynamically generated from capabilities
- capability-aware tooling
- async execution
- acknowledgement support

Examples:
- speak_text
- vibrate_device
- capture_audio
- request_location
- request_snapshot

Requirements:
- permission-aware
- timeout-safe
- observable execution state
```

---

# Verification Checks

- Agent can invoke Android commands
- Offline devices handled gracefully
- Tool execution visible in logs
- Capability checks enforced

---

# Stop Condition

STOP ONLY WHEN:

- agent runtime can naturally interact with Android node

---

# ANDROID APP PHASES

---

# PHASE A0 — Android Runtime Architecture Design

Do NOT let agents jump straight into coding.

---

# Agentic Prompt

```text id="lcx9j3"
Design Drishti Android Node architecture before implementation.

Requirements:
- clean architecture
- modular services
- plugin-ready telemetry system
- capability-based design
- battery-conscious runtime
- offline resilience

Produce:
- package structure
- service lifecycle map
- data flow diagrams
- websocket lifecycle
- telemetry lifecycle
- command execution lifecycle
- permission architecture
- future extensibility strategy

Constraints:
- no implementation yet
- optimize for long-term maintainability
```

---

# Verification Checks

- Architecture diagrams complete
- Lifecycle clearly defined
- Foreground/background strategy stable

---

# Stop Condition

STOP ONLY WHEN:

- architecture reviewed and implementation-ready

---

# PHASE A1 — Core Android Runtime

(same core as earlier but now aligned to Drishti abstractions)

---

# Agentic Prompt

```text id="ydfg6j"
Implement Drishti Android Node runtime.

Requirements:
- Kotlin
- foreground service
- websocket transport
- capability registration
- heartbeat system
- reconnect strategy
- session persistence

The Android node must:
- register itself with Drishti
- advertise capabilities
- maintain persistent connection
- recover from disconnects

Use:
- Hilt
- Coroutines
- WorkManager
- OkHttp WebSocket

Create:
- transport manager
- node registry client
- lifecycle-safe services
- secure credential storage
```

---

# Verification Checks

- Connection survives network switches
- Heartbeats stable
- Capability registration visible server-side
- Reconnects reliable

---

# Stop Condition

STOP ONLY WHEN:

- node remains connected 24h+
- survives reboot/backgrounding

---

# PHASE A2 — Capability Modules

This keeps app modular forever.

---

# Agentic Prompt

```text id="ntpxxk"
Implement modular capability system for Android node.

Each capability must be independently loadable.

Initial capabilities:
- battery
- location
- media
- notifications
- bluetooth
- foreground_app

Create:
- capability interface
- capability manager
- dynamic enable/disable
- telemetry throttling
- permission-aware lifecycle

Requirements:
- isolated failures
- hot registration
- future plugin support
```

---

# Verification Checks

- Modules independently toggle
- Failures isolated
- Event spam controlled
- Permissions handled gracefully

---

# Stop Condition

STOP ONLY WHEN:

- each capability independently functional

---

# PHASE A3 — Realtime Telemetry Pipeline

---

# Agentic Prompt

```text id="ybw1n6"
Implement realtime telemetry pipeline.

Requirements:
- batching
- compression
- delta updates
- retry queue
- offline buffering

Requirements:
- bandwidth-efficient
- battery-efficient
- loss-tolerant

Create:
- telemetry serializer
- batching engine
- retry persistence
- queue prioritization
```

---

# Verification Checks

- Offline queue survives restart
- Delta updates work
- Compression reduces payload size
- Retry queue reliable

---

# Stop Condition

STOP ONLY WHEN:

- telemetry stable under poor network conditions

---

# PHASE A4 — Notification Intelligence Layer

---

# Agentic Prompt

```text id="sk4iqn"
Implement notification intelligence subsystem.

Requirements:
- notification listener service
- filtering
- semantic categorization
- priority scoring
- privacy-safe defaults

Do NOT store sensitive notification content unless explicitly enabled.

Create:
- parser
- classifier hooks
- allowlist/blocklist system
- event summarization
```

---

# Verification Checks

- Notification capture stable
- Sensitive data filtering works
- Event storms prevented

---

# Stop Condition

STOP ONLY WHEN:

- notifications become structured Drishti events

---

# PHASE A5 — Audio + Wakeword Layer

---

# Agentic Prompt

```text id="5mkexr"
Implement wake-word architecture for Android node.

Requirements:
- local wakeword
- low-power idle mode
- streaming after activation only
- VAD support
- audio chunk transport

Prefer:
- openWakeWord
- Whisper-compatible format

Do NOT continuously stream microphone audio.
```

---

# Verification Checks

- Wakeword offline
- Low idle battery usage
- Audio packets stable

---

# Stop Condition

STOP ONLY WHEN:

- wake-word reliably triggers command mode

---

# PHASE A6 — Security Layer

---

# Agentic Prompt

```text id="18pwyo"
Implement secure Android node communication.

Requirements:
- token auth
- TLS/WSS only
- replay protection
- signed commands
- secure keystore integration
- token refresh

Do NOT expose secrets in logs.
```

---

# Verification Checks

- MITM resistance
- Expired tokens fail
- Invalid signatures rejected

---

# Stop Condition

STOP ONLY WHEN:

- communications hardened end-to-end

---

# PHASE A7 — Provisioning + Pairing

---

# Agentic Prompt

```text id="ec6i8q"
Implement Android node onboarding.

Requirements:
- QR pairing
- capability negotiation
- credential provisioning
- device naming
- permission onboarding

Requirements:
- revoke support
- re-pair support
- secure provisioning flow
```

---

# Verification Checks

- QR pairing works
- Revocation works
- Reconnect after reboot works

---

# Stop Condition

STOP ONLY WHEN:

- new phone setup requires <2 mins

---

# FINAL SYSTEM VALIDATION

---

# Final Agentic Prompt

```text id="ok1y6l"
Perform full end-to-end validation of Drishti distributed node architecture.

Validate:
- Android node connectivity
- capability negotiation
- telemetry ingestion
- memory integration
- command dispatch
- agent-device interactions
- reconnect behavior
- offline buffering
- security
- multi-device scalability

Simulate:
- network loss
- backend restart
- Android reboot
- token expiry
- high event throughput
- duplicate packets
- malformed payloads

Generate:
- validation report
- bottleneck report
- architectural weaknesses
- production-readiness assessment
```

---

# FINAL STOP CONDITION

STOP ONLY WHEN:

```text id="jlwmgm"
A real Android phone operates as a persistent Drishti node for 24h+ with:

- stable websocket connection
- live telemetry
- command execution
- memory/context integration
- wake-word support
- reconnect resilience
- acceptable battery usage
- secure communications
```

AND:

```text id="f9buhj"
Drishti agents can naturally reason about and interact with the Android node as part of the cognition ecosystem.
```
