---\ntitle: Architecture Notes\nphase: Phase_AudioStreaming\ngenerated: 2026-06-12T08:27:38Z\nrelated:\n  - [[Implementation Summary]]\n  - [[Changed Files List]]\n  - [[Phase Report]]\n---\n\n# Architecture Notes

- **AudioCollector**: Maintains an `AudioRecord` instance operating at 16kHz, mono, 16-bit PCM. This format is natively compatible with Whisper endpoints without server-side resampling.
- **WakeWordEngine**: Processes the rolling buffer. (Currently mocked with energy thresholding > 15000 amplitude).
- **VadEngine**: Voice Activity Detection. Maintains a silence frame counter. It requires 50 consecutive frames of silence (<500 energy) to trigger a `stream_end` socket event.
- **WebSocket Streaming**: Streaming is event-driven. Base64 chunks are only pushed to `WebSocketManager` *after* the wake word, and *before* VAD cutoff.

Related:
- [[Implementation Summary]]
- [[Changed Files List]]
- [[Phase Report]]
