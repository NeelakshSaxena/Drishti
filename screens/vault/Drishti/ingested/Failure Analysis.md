---\ntitle: Failure Analysis\nphase: Phase_FullSystemValidation\ngenerated: 2026-06-12T08:38:18Z\nrelated:\n  - [[Unresolved Issues]]\n  - [[Unresolved Risks]]\n---\n\n# Failure Analysis

Simulated network drops correctly invoked the exponential backoff reconnect loop in `WebSocketManager.kt`. However, if the backoff reaches its 60-second ceiling and the device goes to Deep Doze, the connection relies entirely on `HeartbeatWorker` which may be deferred by Android up to 15 minutes. 

Related:
- [[Unresolved Issues]]
- [[Unresolved Risks]]
