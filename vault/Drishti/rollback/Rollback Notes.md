---\ntitle: Rollback Notes\nphase: Phase_DeviceOnboarding\ngenerated: 2026-06-12T08:30:39Z\nrelated:\n  - [[Phase Report]]\n---\n\n# Rollback Notes

Rollback Procedure:
1. Revert `AuthTokenManager.kt` back to the static string implementation.
2. Delete `android/app/src/main/java/com/drishti/node/onboarding/OnboardingManager.kt`.
3. Revert `PermissionHelper.kt` to remove `getHealthReport()`.
4. Delete `backend/app/gateway/onboarding.py`.
5. Remove onboarding routing from FastAPI main (if attached).

Related:
- [[Phase Report]]
