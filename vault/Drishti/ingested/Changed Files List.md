---\ntitle: Changed Files List\nphase: Phase_ProductionSecurity\ngenerated: 2026-06-12T08:34:56Z\nrelated:\n  - [[Implementation Summary]]\n  - [[Architecture Notes]]\n  - [[Unresolved Issues]]\n---\n\n# Changed Files List

- `android/app/src/main/java/com/drishti/node/core/Constants.kt` (Enforced WSS/HTTPS and Certificate Pins)
- `android/app/src/main/java/com/drishti/node/networking/CryptoUtils.kt` (New - HMAC and Nonce Gen)
- `android/app/src/main/java/com/drishti/node/networking/AuthTokenManager.kt` (Upgraded to EncryptedSharedPreferences, added expiry)
- `android/app/src/main/java/com/drishti/node/networking/WebSocketManager.kt` (Added payload signing, token rotation triggers, cert pinning)
- `backend/app/gateway/security.py` (New - FastAPI HMAC verification and Replay Protection logic)

Related:
- [[Implementation Summary]]
- [[Architecture Notes]]
- [[Unresolved Issues]]
