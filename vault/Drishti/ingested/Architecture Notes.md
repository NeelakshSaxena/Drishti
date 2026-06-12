---\ntitle: Architecture Notes\nphase: Phase_DeviceOnboarding\ngenerated: 2026-06-12T08:30:39Z\nrelated:\n  - [[Implementation Summary]]\n  - [[Changed Files List]]\n  - [[Phase Report]]\n---\n\n# Architecture Notes

- **OnboardingManager**: Executes a two-step HTTP REST process before shifting to WebSockets. 
  1. Calls `/api/device/register` with `pairing_code` and `deviceName` to fetch a JWT.
  2. Calls `/api/device/sync` parsing the `PermissionHelper.getHealthReport()` which verifies `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, etc., reporting boolean flags directly to the DB.
- **AuthTokenManager**: Refactored to drop the hardcoded string. It now securely writes the returned JWT to a private `SharedPreferences` file (`drishti_auth`).
- **Backend**: Uses a simple active/revoked mapping (`REVOKED_TOKENS` set) which future WebSocket middlewares must check on connection.

Related:
- [[Implementation Summary]]
- [[Changed Files List]]
- [[Phase Report]]
