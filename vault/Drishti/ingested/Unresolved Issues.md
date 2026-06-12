---\ntitle: Unresolved Issues\nphase: Phase_DeviceOnboarding\ngenerated: 2026-06-12T08:30:39Z\nrelated:\n  - [[Verification Report]]\n  - [[Changed Files List]]\n---\n\n# Unresolved Issues

- The physical camera view for the `QrScanner` UI has not been implemented. We rely on a programmatic JSON string injection to test `OnboardingManager.processQrPayload()`.
- The FastAPI backend currently uses in-memory dicts (`DEVICE_DB`) which will wipe upon server restart. Must integrate with Postgres/SQLAlchemy.

Related:
- [[Verification Report]]
- [[Changed Files List]]
