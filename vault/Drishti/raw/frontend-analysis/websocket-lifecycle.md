# Drishti WebSocket Lifecycle

## 1. Overview

| Aspect | Value |
|---|---|
| Endpoint | `ws://{host}/ws/device?token={token}` |
| Protocol | WebSocket (RFC 6455) |
| Auth | Query param `token` → `authenticate_device()` |
| Session Manager | `SessionManager` (in-memory connection map) |

## 2. Connection Flow

1. Client connects to `/ws/device?token=xxx`
2. `authenticate_device(token)` validates → returns `device_id` or `None`
3. Invalid token → `Close(1008, "Invalid auth token")`
4. Valid → `SessionManager.connect(device_id, ws)` → Accept, store, log heartbeat
5. Enter message loop (receive JSON, dispatch by `type`)
6. On disconnect → `SessionManager.disconnect(device_id)` → set status "offline"

## 3. Message Protocol

### Client → Server
- `{ "type": "heartbeat" }` — Heartbeat ping
- `{ "type": "telemetry", "event_type": str, "data": dict }` — Telemetry

### Server → Client
- `{ "type": "ack", "msg_type": str }` — Acknowledgement
- `{ "type": "error", "message": str }` — Error
- `{ "type": "command", "command": str, "parameters": dict }` — Command dispatch

## 4. Frontend Does NOT Use WebSockets

The family tracking frontend uses **HTTP polling exclusively**:

| Feature | Mechanism | Interval |
|---|---|---|
| Parent dashboard | `setInterval` + `fetch` | 5s |
| Child location | `geolocation.watchPosition` + HTTP POST | Continuous |
| Guest view | `setInterval` + `fetch` | 5s |
| Auth/child link check | `setInterval` + `fetch` | 2s |

## 5. Reconnect Behavior

- **No auto-reconnect** on server
- Device must re-establish with valid token
- On disconnect: device state → "offline"

### Android Requirements
- Exponential backoff reconnect (1s → 30s cap)
- Heartbeat every 30s
- Offline message queue
- `ConnectivityManager` monitoring
- Foreground service for background WS

## 6. Token Registry (Dev)

```python
VALID_TOKENS = { "dev-token-123": "device_1", "dev-token-456": "device_2" }
```

## 7. Packet Verification

`POST /verify_packet` with HMAC-SHA256 signature, nonce replay protection, 5s timestamp drift window.
