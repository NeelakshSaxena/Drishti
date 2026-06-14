# Ingested Summary: Device Gateway

## Overview
A new **Device Gateway** service has been added to Drishti. This serves as the asynchronous, realtime WebSocket boundary connecting physical devices to the internal backend abstractions.

## Architecture

1. **Authentication (`backend/app/gateway/auth.py`)**: Checks connecting devices against valid tokens (to be integrated fully with Redis/PostgreSQL later).
2. **Session Manager (`backend/app/gateway/session.py`)**: Maintains a dictionary of active WebSocket connections mapped by `device_id`. Handles sending outgoing commands (`send_command`) and cleanly updating the backend `TelemetryIngestionService` when devices connect and disconnect.
3. **WebSocket Router (`backend/app/gateway/ws.py`)**: Exposes the `/ws/device` endpoint. It processes incoming JSON strings and routes them as either `heartbeat` or `telemetry` payloads. Includes an admin HTTP fallback `POST /dispatch/{device_id}` to test outbound commands.
4. **Integration (`backend/app/main.py`)**: The router is included cleanly into the primary FastAPI application.

## Stability Characteristics
- Drops connections providing invalid tokens.
- Captures and suppresses JSON decode errors gracefully.
- Re-entrant (safe to connect multiple times, drops old disconnected session).
- Automatically updates global state to "offline" if a socket disconnects.
