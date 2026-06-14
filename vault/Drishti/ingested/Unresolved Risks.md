---\ntitle: Unresolved Risks
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related:
- '[[Failure Analysis]]'
- '[[Unresolved Issues]]'
---\n\n\n\n# Unresolved Risks

- **OEM Aggressive Kills**: Certain manufacturers (Xiaomi, Huawei, Samsung) aggressively terminate foreground services regardless of `START_STICKY`. The `HeartbeatWorker` helps, but users may need to manually exempt Drishti Node from Battery Optimization settings.
- **Clock Sync Drift**: The HMAC replay protection uses a strict 5000ms timestamp window. If the device clock drifts significantly, the node will be permanently locked out. Needs an NTP-sync integration fallback.

Related:
- [[Failure Analysis]]
- [[Unresolved Issues]]\n\n---\n\n## Related Documents\n- [[Failure Analysis]]\n- [[Unresolved Issues]]\n\n## Referenced By\n- [[Failure Analysis]]\n- [[Phase Index]]\n- [[Unresolved Issues]]\n