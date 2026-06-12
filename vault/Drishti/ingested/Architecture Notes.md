---\ntitle: Architecture Notes\nphase: Phase_ProductionSecurity\ngenerated: 2026-06-12T08:34:56Z\nrelated:\n  - [[Implementation Summary]]\n  - [[Changed Files List]]\n  - [[Phase Report]]\n---\n\n# Architecture Notes

- **Replay Protection**: The `WebSocketManager` appends a secure random 16-byte `nonce` (Base64) and standard unix `timestamp` to every packet. `security.py` rejects any matching nonces in its fast-cache, or any packet where `abs(current_time - packet_time) > 5000ms`.
- **HMAC Signatures**: Raw packet JSON is strung and signed via `HmacSHA256` using the `device_secret` issued during onboarding. The packet layout becomes `{\"payload\": {...}, \"signature\": \"HMAC...\"}`. Invalid signatures are hard-rejected.
- **Encrypted Storage**: The `AuthTokenManager` leverages AndroidX Security Crypto (`EncryptedSharedPreferences`), wrapping local keys via `AES256_GCM` derived from the hardware-backed Android Keystore system. Token secrets are not logged in logcat.

Related:
- [[Implementation Summary]]
- [[Changed Files List]]
- [[Phase Report]]
