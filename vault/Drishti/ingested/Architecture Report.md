---\ntitle: Architecture Report
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related:
- '[[Architecture Notes]]'
- '[[Implementation Summary]]'
- '[[Phase Report]]'
---\n\n\n\n# Architecture Report

The current topology utilizes an Android Kotlin client communicating over standard JSON-WSS to a Python FastAPI backend.
The Android client utilizes Clean Architecture with Hilt DI, segregating the domain across `telemetry`, `networking`, `services`, `permissions`, and `audio`.
The backend uses a standard Gateway pattern parsing incoming raw WSS into validated Pydantic schemas, running through `SecurityInterceptor` HMAC checks before handing it off to the ingestion memory stores.

Related:
- [[Implementation Summary]]
- [[Phase Report]]
- [[Architecture Notes]]\n\n---\n\n## Related Documents\n- [[Architecture Notes]]\n- [[Implementation Summary]]\n- [[Phase Report]]\n\n## Referenced By\n- [[Architecture Notes]]\n- [[Implementation Summary]]\n- [[Phase Index]]\n- [[Phase Report]]\n