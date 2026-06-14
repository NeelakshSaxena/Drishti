---
title: Keystore Handling Docs
phase: Release Packaging Phase
generated: 2026-06-14T13:47:51+05:30
---
# Keystore Handling

The `release.keystore` file is located in `android/app/release.keystore`.

- **Alias**: release
- **Key Algorithm**: RSA (2048-bit)
- **Validity**: 10000 days

**WARNING**: Do NOT commit `release.keystore` or its passwords in public repositories. Passwords should be migrated to GitHub Secrets for CI/CD injection.
