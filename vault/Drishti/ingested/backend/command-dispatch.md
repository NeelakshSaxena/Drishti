---\ntitle: command-dispatch
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related: []
---\n\n# Ingested Summary: Command Dispatch

## Overview
Drishti now features a robust device command dispatch system allowing asynchronous agents to schedule actions that will safely execute on the target devices.

## Architecture

1. **Schemas (`backend/app/commands/device/schemas.py`)**: Universal `DeviceCommand` modeling support for extensible commands (`speak_text`, `vibrate`, `request_snapshot`, etc.) alongside lifecycle parameters like `retries`, `expires_at`, and `signature`.
2. **Offline Queue (`backend/app/queue/device/offline_queue.py`)**: A persistent queue (currently JSON-backed) ensuring that if a device disconnects, commands queue up safely and resume dispatching instantly upon reconnect. It passively purges expired commands during reads.
3. **Dispatcher (`backend/app/dispatch/device/dispatcher.py`)**: Coordinates the transition of commands between the queue and the live WebSocket send-callbacks. Handles ACK tracking, preventing duplicate executions using an internal set, and bumps retry counts on NACKs.
4. **Signer (`backend/app/commands/device/signer.py`)**: Generates an HMAC SHA-256 signature binding the command details. Ensures commands are tamper-proof in transit and cannot be forged.\n\n---\n\n## Related Documents\nNone\n\n## Referenced By\nNone\n