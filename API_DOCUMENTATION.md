# Drishti API Documentation

## Overview
Extended FastAPI backend with in-memory storage for managing children, trips, events, and locations. All data is persisted to a JSON file for recovery across restarts.

## Features Implemented

### 1. ✅ In-Memory Storage
- **Location**: `backend/app/services/storage.py`
- Global dictionaries: `children`, `trips`, `locations`
- JSON persistence to `backend/data/storage.json`
- Auto-saves after each operation
- Auto-loads on startup

### 2. ✅ Data Models
- **Child**: id, name, active_trip_id, created_at
- **Trip**: id, child_id, status, current_event_index, events[], created_at, updated_at
- **Event**: id, type, from, to, time, ticket_url, status, id
- **Location**: child_id, lat, lng, updated_at

### 3. ✅ API Endpoints

#### Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "backend": "running",
  "services": {
    "api": true,
    "memory_store": true
  },
  "errors": []
}
```

#### Parent Routes

**Create Child**
```
POST /parent/create-child
Content-Type: application/json

{
  "name": "Alice"
}
```

Response:
```json
{
  "id": "ec7162d9-...",
  "name": "Alice",
  "active_trip_id": null,
  "created_at": "2026-05-04T15:47:01.485332"
}
```

**Get All Children**
```
GET /parent/children
```

Response:
```json
[
  {
    "id": "ec7162d9-...",
    "name": "Alice",
    "active_trip_id": null,
    "created_at": "2026-05-04T15:47:01.485332"
  }
]
```

**Get Specific Child**
```
GET /parent/child/{child_id}
```

Response:
```json
{
  "id": "ec7162d9-...",
  "name": "Alice",
  "active_trip_id": null,
  "created_at": "2026-05-04T15:47:01.485332"
}
```

#### Child Routes

**Start Trip**
```
POST /child/{child_id}/trip/start
Content-Type: application/json

{
  "events": [
    {
      "type": "flight",
      "from": "NYC",
      "to": "London",
      "time": "2026-05-05T10:00:00",
      "ticket_url": "http://example.com/ticket"
    }
  ]
}
```

Response:
```json
{
  "status": "success",
  "trip": {
    "id": "8b23315d-...",
    "child_id": "a018139a-...",
    "status": "active",
    "current_event_index": 0,
    "events": [
      {
        "id": "event-id",
        "type": "flight",
        "from": "NYC",
        "to": "London",
        "time": "2026-05-05T10:00:00",
        "ticket_url": "http://example.com/ticket",
        "status": "current"
      }
    ],
    "created_at": "2026-05-04T15:47:55.173086",
    "updated_at": "2026-05-04T15:47:55.173095"
  }
}
```

**End Trip**
```
POST /child/{child_id}/trip/end
Content-Type: application/json
```

Response:
```json
{
  "status": "success",
  "trip": {
    "id": "8b23315d-...",
    "status": "ended",
    ...
  }
}
```

**Add Event to Trip**
```
POST /trip/{trip_id}/event/add
Content-Type: application/json

{
  "type": "train",
  "from": "London",
  "to": "Paris",
  "time": "2026-05-06T14:00:00",
  "ticket_url": "http://example.com/train"
}
```

Response:
```json
{
  "status": "success",
  "event": {
    "id": "6dfe269d-...",
    "type": "train",
    "from": "London",
    "to": "Paris",
    "time": "2026-05-06T14:00:00",
    "ticket_url": "http://example.com/train",
    "status": "upcoming"
  }
}
```

**Advance to Next Event**
```
POST /trip/{trip_id}/event/next
Content-Type: application/json
```

Response:
```json
{
  "status": "success",
  "current_event_index": 1,
  "current_event": {
    "id": "6dfe269d-...",
    "type": "train",
    "from": "London",
    "to": "Paris",
    "time": "2026-05-06T14:00:00",
    "ticket_url": "http://example.com/train",
    "status": "current"
  },
  "trip_status": "active"
}
```

**Update Location**
```
POST /child/{child_id}/location/update
Content-Type: application/json

{
  "lat": 51.5074,
  "lng": 0.1278
}
```

Response:
```json
{
  "status": "success",
  "location": {
    "child_id": "a018139a-...",
    "lat": 51.5074,
    "lng": 0.1278,
    "updated_at": "2026-05-04T15:48:09.012350"
  }
}
```

### 4. ✅ CORS Configuration
- Configured for Vercel domains: `https://*.vercel.app`, `https://vercel.app`
- Local development: `http://localhost:3000`, `http://127.0.0.1:3000`
- Allows credentials and all HTTP methods

### 5. ✅ Logging
- Configured to log to stdout with timestamps
- All requests and errors logged
- Health check includes error reporting

### 6. ✅ Error Handling
- Structured JSON error responses
- HTTP status codes (400, 404, 500)
- Input validation with meaningful error messages
- No crashes - all exceptions caught and logged

## Files Modified/Created

### Modified
- `backend/app/main.py` - Added storage initialization, logging, new router
- `backend/app/models/schemas.py` - Added new request/response models

### Created
- `backend/app/services/storage.py` - In-memory storage with JSON persistence
- `backend/app/routes/management.py` - Parent and child management routes
- `backend/data/storage.json` - Persisted storage file (auto-created)

## Backward Compatibility

✅ All existing endpoints preserved:
- `/process/verify-flight`
- `/process/start-trip`
- `/process/update-segment-status`
- `/process/log-location`
- `/process/end-trip`
- `/process/reset-trip`
- `/process/status`
- `/process/trip-info`
- `/process/trip-log`

## Running the Backend

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API will be available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

## Testing

All endpoints tested and working:
- ✅ Health check
- ✅ Create child
- ✅ Get all children
- ✅ Get specific child
- ✅ Start trip with events
- ✅ Add events to trip
- ✅ Advance to next event
- ✅ Update location
- ✅ End trip
- ✅ Data persistence
- ✅ Legacy process endpoints

## Data Persistence

Data is automatically saved to `backend/data/storage.json` after each operation:
- Children
- Trips with events
- Location tracking

On server restart, data is automatically loaded from the file.

## Architecture

```
backend/
├── app/
│   ├── main.py                 # FastAPI app setup, storage init
│   ├── models/
│   │   └── schemas.py          # Pydantic models for validation
│   ├── routes/
│   │   ├── process.py          # Legacy routes (unchanged)
│   │   └── management.py       # New parent/child routes
│   ├── services/
│   │   ├── processing.py       # Legacy business logic
│   │   └── storage.py          # In-memory storage with persistence
│   └── __init__.py
├── data/
│   └── storage.json            # Persisted data file
└── requirements.txt
```

## Next Steps (Optional)

1. **Database Migration**: Replace JSON file with PostgreSQL/MongoDB
2. **Authentication**: Add JWT or OAuth2
3. **Real-time Updates**: Add WebSocket support
4. **Validation**: Add stricter input validation
5. **Testing**: Add comprehensive unit and integration tests
6. **Monitoring**: Add metrics collection and alerting
