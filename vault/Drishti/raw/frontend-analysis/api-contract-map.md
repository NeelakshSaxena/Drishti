# Drishti API Contract Map

> Comprehensive mapping of all backend API endpoints consumed by the frontend.

---

## Base URL Configuration

| Environment | URL |
|---|---|
| Production | `https://drishti-walb.onrender.com` |
| Local Development | `http://127.0.0.1:8000` |
| Resolution Order | `NEXT_PUBLIC_API_BASE_URL` → `NEXT_PUBLIC_API_URL` → hardcoded fallback |

**Backend Framework:** FastAPI (Python, uvicorn)
**Frontend Framework:** Next.js 14 (React 18, TypeScript)

---

## 1. Health & Root Endpoints

| Method | Endpoint | Router Prefix | Auth | Request | Response |
|---|---|---|---|---|---|
| `GET` | `/` | — | None | — | `{ status, service, version }` |
| `GET` | `/health` | — | None | — | `{ status: "healthy" }` |
| `GET` | `/family/health` | `/family` | None | — | `HealthCheckResponse { status, backend, services, errors }` |

---

## 2. Registration Endpoints (Family Router: `/family`)

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/family/parent/init` | None | `{ name: str, email: str, password?: str }` | `{ success, parent_id, name }` or `{ success: false, message }` |
| `POST` | `/family/child/init` | None | `{ name: str, email?: str, age?: int, password?: str }` | `{ success, child_id, child_code, name }` or `{ success: false, message }` |

### Duplicate Detection
- Parent: `storage.find_parent_by_email(email)` — returns existing → `{ success: false }`
- Child: `storage.find_child_by_email(email)` — returns existing → `{ success: false }`

---

## 3. Login Endpoints

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/family/parent/login` | None | `{ name?: str, email: str, password?: str }` | `{ success, parent_id, name }` or `{ success: false, message }` |
| `POST` | `/family/child/login` | None | `{ name?: str, email: str, password?: str }` | `{ success, child_id, child_code, name }` or `{ success: false, message }` |

### Backend Implementation
- Parent: `storage.find_parent_by_name_and_email(name, email, password)`
- Child: `storage.find_child_by_email(email, password)`

---

## 4. Linking Endpoints

| Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/family/parent/link-child?parent_id={id}` | Query param `parent_id` | `{ child_code: str }` | `{ success, message, child_name }` |

---

## 5. Dashboard Endpoints

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| `GET` | `/family/parent/dashboard?parent_id={id}` | Query param `parent_id` | `{ parent: Parent, linked_children: Child[] }` |
| `GET` | `/family/child/dashboard?child_id={id}` | Query param `child_id` | `{ child: Child, current_trip: Trip?, parent_name: str? }` |

---

## 6. Location Endpoints

| Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/family/child/location?child_id={id}` | Query param | `{ lat: float, lon: float }` | `{ success: true }` |
| `POST` | `/family/child/stop-sharing?child_id={id}` | Query param | — | `{ success: true }` |

---

## 7. Share Link Endpoints

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| `POST` | `/family/child/share-link?child_id={id}` | Query param | `{ success, token, url, expires_at }` |
| `GET` | `/family/guest/{token}` | Token in URL path | `{ child_name, parent_name, lat, lon, is_sharing, location_updated_at, current_trip, trip_history }` |

---

## 8. Trip Management Endpoints

| Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/family/child/trip/start?child_id={id}` | Query param | — | `{ success, trip: Trip }` |
| `POST` | `/family/child/trip/end?child_id={id}` | Query param | — | `{ success: true }` |
| `POST` | `/family/child/trip/event?child_id={id}` | Query param | `TripEventRequest` | `{ success, event: TripEvent }` |

---

## 9. WebSocket Endpoints

| Protocol | Endpoint | Router Prefix | Auth |
|---|---|---|---|
| `WS` | `/ws/device?token={token}` | `/ws` | Query param `token` → `authenticate_device(token)` |

### WebSocket Message Types (Client → Server)

| type | Payload | Description |
|---|---|---|
| `heartbeat` | `{ type: "heartbeat" }` | Device heartbeat ping |
| `telemetry` | `{ type: "telemetry", event_type: str, data: dict }` | Telemetry data submission |

### WebSocket Message Types (Server → Client)

| type | Payload | Description |
|---|---|---|
| `ack` | `{ type: "ack", msg_type: str }` | Acknowledgement of received message |
| `error` | `{ type: "error", message: str }` | Error notification |
| `command` | `{ type: "command", command: str, parameters: dict }` | Command dispatch to device |

---

## 10. Device Gateway Endpoints

| Method | Endpoint | Router Prefix | Auth | Description |
|---|---|---|---|---|
| `POST` | `/ws/dispatch/{device_id}` | `/ws` | None (admin) | Dispatch command to connected device |

---

## 11. Device Onboarding Endpoints (Gateway Module)

| Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/register` | Pairing code | `{ pairing_code: str, name: str }` | `{ token, device_id }` |
| `POST` | `/sync` | Bearer token | `{ capabilities: list, health: dict }` | `{ status: "synced" }` |
| `POST` | `/revoke` | Admin | `{ device_id: str }` | `{ status: "revoked" }` |

---

## 12. Security Endpoints (Gateway Module)

| Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|
| `POST` | `/verify_packet` | `device_id` Header | `{ payload: dict, signature: str }` | `{ status: "verified" }` |

### Security Features
- HMAC-SHA256 signature verification
- Nonce-based replay protection
- 5-second timestamp drift window

---

## 13. Legacy Endpoints (Process Router: `/process`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/process/start-trip` | None | Legacy trip start (backward compat) |

---

## 14. Admin Endpoints (Root Router: `/root`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| Various | `/root/*` | None | Administrative management routes |

---

## Data Models (Pydantic Schemas)

### Parent
```
id: str (UUID)
name: str?
email: str?
linked_children: list[str]  # child IDs
created_at: datetime
```

### Child
```
id: str (UUID)
name: str?
email: str?
child_code: str  # 6-char linking code
parent_id: str?
active_trip_id: str?
current_trip: Trip?
trip_history: list[Trip]
lat: float?
lon: float?
created_at: datetime
```

### Trip
```
id: str (UUID)
events: list[TripEvent]
status: "active" | "ended"
started_at: datetime
ended_at: datetime?
```

### TripEvent
```
id: str (UUID)
type: str  # flight, train, bus, hostel, custom
from_location: str
to_location: str
time: str?
description: str
created_at: datetime
```
