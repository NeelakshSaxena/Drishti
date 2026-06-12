---\ntitle: Unresolved Issues\nphase: Phase_AudioStreaming\ngenerated: 2026-06-12T08:27:38Z\nrelated:\n  - [[Verification Report]]\n  - [[Changed Files List]]\n---\n\n# Unresolved Issues

- The `WakeWordEngine` is currently a naive amplitude tracker. It must be swapped with an actual ONNX/TFLite model or Porcupine instance to recognize specific keywords (e.g. "Hey Drishti") without false positives.
- `android.permission.RECORD_AUDIO` requires a runtime permission prompt on modern Android versions, which needs to be added to the MainActivity onboarding flow.

Related:
- [[Verification Report]]
- [[Changed Files List]]
