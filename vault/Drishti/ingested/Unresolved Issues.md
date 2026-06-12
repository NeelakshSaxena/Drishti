---\ntitle: Unresolved Issues\nphase: Phase_ProductionSecurity\ngenerated: 2026-06-12T08:34:56Z\nrelated:\n  - [[Verification Report]]\n  - [[Changed Files List]]\n---\n\n# Unresolved Issues

- The `CERT_PIN` in `Constants.kt` currently holds a placeholder hash (`AAAAAAAA...`). Needs replacement with the actual production leaf certificate hash prior to public release.
- Backend `USED_NONCES` tracking is stored in memory, which resets on pod restarts. Needs a fast Redis cache with a 5-second TTL.

Related:
- [[Verification Report]]
- [[Changed Files List]]
