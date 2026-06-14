---\ntitle: Unresolved Risks\nphase: Phase_FullSystemValidation\ngenerated: 2026-06-12T08:38:18Z\nrelated:\n  - [[Failure Analysis]]\n  - [[Unresolved Issues]]\n---\n\n# Unresolved Risks

- **OEM Aggressive Kills**: Certain manufacturers (Xiaomi, Huawei, Samsung) aggressively terminate foreground services regardless of `START_STICKY`. The `HeartbeatWorker` helps, but users may need to manually exempt Drishti Node from Battery Optimization settings.
- **Clock Sync Drift**: The HMAC replay protection uses a strict 5000ms timestamp window. If the device clock drifts significantly, the node will be permanently locked out. Needs an NTP-sync integration fallback.

Related:
- [[Failure Analysis]]
- [[Unresolved Issues]]
