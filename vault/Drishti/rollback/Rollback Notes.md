---\ntitle: Rollback Notes\nphase: Phase_ProductionSecurity\ngenerated: 2026-06-12T08:34:56Z\nrelated:\n  - [[Phase Report]]\n---\n\n# Rollback Notes

Rollback Procedure:
1. Revert `Constants.kt` schemas back to `http://` / `ws://`.
2. Delete `CryptoUtils.kt`.
3. Revert `AuthTokenManager.kt` to drop `EncryptedSharedPreferences` and switch back to `Context.MODE_PRIVATE`.
4. Revert `WebSocketManager.kt` to remove the `signature` packing logic and Certificate Pinner.
5. Delete `backend/app/gateway/security.py`.

Related:
- [[Phase Report]]
