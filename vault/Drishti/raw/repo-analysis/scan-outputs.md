---\ntitle: scan-outputs
type: document
created: '2026-06-12T08:41:38Z'
vault: Drishti
tags:
- drishti
related: []
---\n\n# Raw Repo Analysis: Drishti

## Repository Structure Overview

- **`backend/`**: FastAPI backend application.
- **`frontend/`**: Next.js React frontend.
- **`android/`**: Contains only markdown documentation (`integrationDoc-v2.md`, `integrationDoc.md`) planning device integration. No Android code exists yet.
- **`vault/`**: Storage directory for architecture plans and reports.

## Backend Scan Results

### Entrypoint
- `backend/app/main.py`: Initializes FastAPI app, CORS, sets up storage on startup, and registers routers.

### Core Dependencies (Inferred)
- `fastapi`, `uvicorn` (Web Framework)
- `psycopg2` (PostgreSQL Database adapter)
- `geocoder`, `geopy` (Location tracking / resolution)
- `requests` (External API calls)
- `playwright`, `folium` (Map screenshot generation)

### Routing
- `process.py`: Legacy and utility endpoints (`/start-trip`, `/log-location`, `/verify-flight`).
- `management.py`: Trip management (`/child/{id}/trip/start`, `/trip/{id}/event/add`, `/child/{id}/location/update`).
- `family.py`: Auth and linking (`/parent/init`, `/child/init`, `/parent/login`, `/parent/link-child`, `/child/share-link`).
- `admin.py`: Root endpoints protected by `ROOT_PASSWORD`.

### Storage & Persistence
- `backend/app/services/storage.py`: Contains PostgreSQL queries for `parents` and `children` tables.
- `backend/app/services/processing.py`: Contains JSON file reads/writes for legacy session tracking (`trip_info.json`, `trip_log.json`, `session_log.json`).

### Missing Subsystems
- **WebSockets**: No WebSocket implementations found in the current backend.
- **Event Bus / PubSub**: No message brokers (Redis, Kafka, RabbitMQ) are configured or used. State updates are synchronous.\n\n---\n\n## Related Documents\nNone\n\n## Referenced By\nNone\n