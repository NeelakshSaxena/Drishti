---\ntitle: context-ingestion
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related: []
---\n\n# Ingested Summary: Context Ingestion

## Overview
Drishti now converts raw, incoming device telemetry into structured, queryable contextual memory. This bridges the physical device states (battery, media, location, etc.) to the Agent cognition system.

## Architecture

1. **Telemetry Processor (`backend/app/ingestion/device/telemetry_processor.py`)**: Central ingestion handler. Enforces:
   - Deduplication (using SHA-256 hashes of the payloads).
   - Timestamp Normalization (forces UTC, handles malformed inputs).
   - Confidence Scoring & Tagging (rates system events at 1.0, inferred events lower, and applies taxonomic tags).
   - Validation (safely drops malformed non-dictionary payloads).
2. **Temporal Store (`backend/app/memory/device/temporal_store.py`)**: Dual-purpose memory backend tracking complete temporal history logs alongside a fast `latest_state` index for zero-latency lookups.
3. **Agent API (`backend/app/context/device/agent_api.py`)**: A direct interface for agents to fetch current state, temporal history limits, or semantic string explanations (e.g., "Battery is at 89%. Currently playing: Lofi Hip Hop.")
4. **Replay Pipeline (`backend/app/pipelines/device/replay.py`)**: Mechanism to wipe current state and re-ingest historical events chronologically to rebuild context.\n\n---\n\n## Related Documents\nNone\n\n## Referenced By\nNone\n