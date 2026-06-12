---\ntitle: Architecture Report\nphase: Phase_FullSystemValidation\ngenerated: 2026-06-12T08:38:18Z\nrelated:\n  - [[Implementation Summary]]\n  - [[Phase Report]]\n  - [[Architecture Notes]]\n---\n\n# Architecture Report

The current topology utilizes an Android Kotlin client communicating over standard JSON-WSS to a Python FastAPI backend.
The Android client utilizes Clean Architecture with Hilt DI, segregating the domain across `telemetry`, `networking`, `services`, `permissions`, and `audio`.
The backend uses a standard Gateway pattern parsing incoming raw WSS into validated Pydantic schemas, running through `SecurityInterceptor` HMAC checks before handing it off to the ingestion memory stores.

Related:
- [[Implementation Summary]]
- [[Phase Report]]
- [[Architecture Notes]]
