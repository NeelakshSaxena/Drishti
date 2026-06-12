---\ntitle: Rollback Notes\nphase: Phase_AudioStreaming\ngenerated: 2026-06-12T08:27:38Z\nrelated:\n  - [[Phase Report]]\n---\n\n# Rollback Notes

Rollback Procedure:
1. Delete `android/app/src/main/java/com/drishti/node/audio/` package and its contents.
2. Revert `NodeForegroundService.kt` to stop initializing `AudioCollector`.
3. Revert `AppModule.kt` to remove audio dependency injection.
4. Remove `<uses-permission android:name="android.permission.RECORD_AUDIO" />` and `microphone` foreground tag from `AndroidManifest.xml`.

Related:
- [[Phase Report]]
