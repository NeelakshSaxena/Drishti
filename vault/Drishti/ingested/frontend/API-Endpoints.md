# API Endpoints Quick Reference (Ingested)

## Family Routes (prefix: `/family`)

### Registration
| Endpoint | Method | Body |
|---|---|---|
| `/family/parent/init` | POST | `{ name, email, password? }` |
| `/family/child/init` | POST | `{ name, email?, age?, password? }` |

### Login
| Endpoint | Method | Body |
|---|---|---|
| `/family/parent/login` | POST | `{ name?, email, password? }` |
| `/family/child/login` | POST | `{ name?, email, password? }` |

### Dashboards
| Endpoint | Method | Params |
|---|---|---|
| `/family/parent/dashboard` | GET | `?parent_id=X` |
| `/family/child/dashboard` | GET | `?child_id=X` |

### Linking
| Endpoint | Method | Params + Body |
|---|---|---|
| `/family/parent/link-child` | POST | `?parent_id=X` + `{ child_code }` |

### Location
| Endpoint | Method | Params + Body |
|---|---|---|
| `/family/child/location` | POST | `?child_id=X` + `{ lat, lon }` |
| `/family/child/stop-sharing` | POST | `?child_id=X` |

### Sharing
| Endpoint | Method | Params |
|---|---|---|
| `/family/child/share-link` | POST | `?child_id=X` |
| `/family/guest/{token}` | GET | token in path |

### Trips
| Endpoint | Method | Params |
|---|---|---|
| `/family/child/trip/start` | POST | `?child_id=X` |
| `/family/child/trip/end` | POST | `?child_id=X` |
| `/family/child/trip/event` | POST | `?child_id=X` + TripEventRequest body |

## WebSocket
| Endpoint | Protocol | Auth |
|---|---|---|
| `/ws/device?token=X` | WS | Query param token |

## Health
| Endpoint | Method |
|---|---|
| `/health` | GET |
| `/family/health` | GET |
