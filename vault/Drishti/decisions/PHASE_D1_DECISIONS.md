# Phase D1 Decisions

## Decisions Made
1. **Repository Audit**: We decided to map the existing backend architecture purely descriptively without modifying any source files to preserve the initial state.
2. **Device Gateway Location**: We identified that the Device Gateway (WebSockets) should likely live in a new router or service (`services/device-gateway`) rather than cramming it into the existing `management.py` routes, ensuring a clean boundary.
3. **Database Layer Target**: When integrating device domain logic in Phase D2, we will target the PostgreSQL database through `psycopg2` in `storage.py` rather than extending the legacy JSON file-based approach currently in `processing.py`.
4. **Android Client Scope**: Because the Android folder currently contains no code, we decided not to audit an Android implementation but rather establish the backend capabilities it will eventually connect to.
