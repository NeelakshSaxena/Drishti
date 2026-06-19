This is actually a _very good_ state to be in now.

You’ve crossed the hardest line already:

```text id="g7s5a0"
Android Device
    ↕
Realtime Gateway
    ↕
Telemetry Stream
```

is LIVE.

That means:

- websocket works
- heartbeats work
- telemetry collectors work
- Android foreground services work
- backend ingestion works

The remaining problem is now:

> identity + persistence + parent-child linkage.

Which is WAY easier than fixing transport/runtime issues.

Your current architecture status from the logs and code inspection is:

| Layer                | Status |
| -------------------- | ------ |
| Android telemetry    | ✅     |
| Websocket transport  | ✅     |
| Heartbeat ACK        | ✅     |
| Foreground service   | ✅     |
| Device cache         | ✅     |
| Device persistence   | ❌     |
| Parent-child linking | ❌     |
| Supabase persistence | ❌     |
| Dashboard visibility | ❌     |

So now the prompts should evolve from:

> “build Android app”

to:

> “productionize device identity and ownership.”

---

# UPDATED PHASE M5 — REAL DEVICE ↔ CHILD LINKING

This replaces the earlier generic M5.

---

# PHASE M5R — REAL DEVICE OWNERSHIP & CHILD LINKING

## Objective

Convert the temporary websocket-only device identity system into a persistent parent-child linked device architecture integrated with Supabase.

Current issue:

- gateway/auth.py maps hardcoded token → "device_1"
- telemetry exists only in memory
- no linkage to child_id
- frontend cannot see device

This phase establishes:

- persistent device ownership
- parent-child linkage
- token-backed device identity
- Supabase persistence
- frontend visibility

---

# Agentic Prompt

```text id="t8p3kq"
Replace the temporary in-memory device authentication architecture with a persistent production-grade device identity system.

Current state:
- gateway/auth.py maps hardcoded token "dev-token-123" -> "device_1"
- device exists only in DeviceStateCache
- telemetry is discarded on restart
- frontend cannot see device

Goal:
Link Android device telemetry to real child accounts stored in Supabase.

Backend:
https://drishti-walb.onrender.com

Frontend:
https://drishti-phi.vercel.app/

Requirements:
1. Device Registration
- Android app must register itself permanently
- backend generates persistent device_id
- backend generates secure device token
- device token maps to actual child_id

2. Child Linking
- parent frontend generates child_code
- Android app accepts child_code
- backend validates child_code
- backend links:
    device_id -> child_id -> parent account

3. Gateway Auth Refactor
Replace:
hardcoded token -> device_1

With:
secure token lookup from database

Requirements:
- websocket auth validates token
- lookup actual device_id
- lookup actual child_id
- load persistent capabilities/state

4. Telemetry Persistence
Incoming telemetry must:
- attach to child_id
- persist into Supabase
- update current_trip state
- become queryable from frontend

5. Reconnect Persistence
After reboot/reconnect:
- device retains identity
- websocket reconnect restores session
- telemetry continues seamlessly

6. Security
- signed device tokens
- token expiry support
- replay protection preserved
- revoke support preserved

Implement:
- database mappings
- migration scripts
- registration APIs
- child linking APIs
- websocket auth lookup
- telemetry persistence layer

Do NOT break existing frontend flows.
Android must integrate cleanly into existing ecosystem.

Store:
vault/Drishti/raw/linking/
vault/Drishti/verification/linking/
vault/Drishti/phase-reports/M5R_DEVICE_LINKING.md
```

---

# REQUIRED BACKEND CHANGES

Likely additions/refactors:

```text id="e3h1wp"
backend/gateway/auth.py
backend/routes/device.py
backend/storage/device_repository.py
backend/storage/telemetry_repository.py
backend/models/device.py
backend/models/telemetry.py
backend/services/device_linking.py
```

---

# REQUIRED DATABASE CHANGES

Agent should likely create:

```text id="5o6czv"
devices
device_sessions
device_capabilities
device_telemetry
device_tokens
```

And relations:

```text id="jlwm8q"
device -> child
child -> parent
```

---

# Verification Checks

Agent MUST verify:

## Registration

- Android registers successfully
- device_id persisted
- token persisted securely

## Linking

- child_code validation works
- device linked to correct child
- parent can see device

## Gateway

- websocket auth uses DB lookup
- hardcoded token removed
- reconnect restores identity

## Persistence

- telemetry survives backend restart
- telemetry visible in Supabase
- frontend can query live device state

## Security

- invalid tokens rejected
- revoked devices disconnected
- replay attacks rejected

---

# Stop Condition

STOP ONLY WHEN:

```text id="jlwm6z"
A real Android device:
- is linked to a real child account
- persists identity across reboots
- streams telemetry into Supabase
- appears on parent dashboard/frontend
- reconnects automatically
- survives backend restart without losing identity
```

---

# NEW PHASE M5.5 — LIVE TELEMETRY ↔ FRONTEND INTEGRATION

This is now needed because telemetry exists but frontend visibility does not.

---

# Agentic Prompt

```text id="b9z5rf"
Integrate live Android telemetry into frontend-visible realtime state.

Requirements:
- parent dashboard displays live Android state
- telemetry updates current_trip in realtime
- websocket/frontend subscriptions update instantly

Expose:
- battery
- location
- connectivity
- heartbeat
- device online/offline
- media state
- permission health

Requirements:
- debounce frontend updates
- avoid telemetry flooding
- preserve frontend performance
- support reconnect replay

Frontend must display:
- live heartbeat timestamp
- device online/offline state
- last telemetry received
- current Android node health
```

---

# Verification Checks

- frontend updates live
- reconnect restores stream
- stale devices marked offline
- telemetry timestamps accurate

---

# Stop Condition

STOP ONLY WHEN:

```text id="jlwm1a"
Parent frontend displays live Android device telemetry in realtime.
```

---

# UPDATED PHASE M6 — REAL ADB + LIVE TESTING

Now your deployment phase should include live auth/linking validation.

---

# UPDATED Agentic Prompt

```text id="4f0r3n"
Update ADB deployment/testing pipeline to support full live backend validation.

Requirements:
- uninstall old app
- reinstall latest APK
- clear stale auth state if requested
- auto-launch app
- monitor websocket logs
- monitor heartbeat logs
- monitor telemetry logs

After install:
1. login using test account
2. validate backend auth
3. validate websocket auth
4. validate child linking
5. validate telemetry persistence
6. validate frontend visibility

Test credentials:
email:
neelaksh7.saxena@gmail.com

password:
N33L4K8H@drishti

Generate:
- adb deployment logs
- websocket traces
- telemetry traces
- linking traces
- frontend visibility validation

Capture:
- logcat
- websocket lifecycle
- reconnect events
- auth failures
```

---

# Verification Checks

- APK installs
- login succeeds
- device links correctly
- telemetry visible in frontend
- reconnect works

---

# Stop Condition

STOP ONLY WHEN:

```text id="jlwm9p"
A freshly installed Android app can:
- login
- register device
- link to child
- reconnect automatically
- appear on frontend dashboard
- stream persistent telemetry
```

---

# MOST IMPORTANT ARCHITECTURE CHANGE

You should ALSO add this requirement now:

---

# NEW GLOBAL RULE — NO IN-MEMORY AUTHORITATIVE STATE

Add this to ALL future prompts:

```text id="jlwmte"
Do NOT use in-memory caches as the authoritative source of truth.

Memory caches may exist only as:
- performance accelerators
- websocket session caches
- reconnect optimization layers

Authoritative state must persist in:
- Supabase/Postgres
- durable storage
- persistent repositories

The system must survive:
- backend restarts
- websocket reconnects
- Android reboot
- deployment restarts
without identity loss.
```

---

# Your Current Status (Honestly)

You’re now beyond:

> “toy Android companion app”

This is now becoming:

```text id="jlwm4u"
Distributed Realtime Device Infrastructure
```

Which is the correct direction for Drishti long-term.

And importantly:
you discovered the _real_ missing layer early:

> persistent identity + ownership graph.

That’s exactly the right thing to solve next.
