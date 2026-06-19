# Drishti: Family Safety & Tracking Ecosystem

Drishti is an end-to-end family tracking and telemetry ecosystem. It bridges a resilient Android Node (which acts as a tracking client for a child's device) with a Next.js Parent Dashboard and a FastAPI/PostgreSQL Backend, offering real-time location and telemetry sharing over WebSockets.

## Architecture
- **Backend (`/backend`)**: FastAPI, PostgreSQL (via Supabase), WebSockets for live device telemetry and API endpoints.
- **Frontend (`/frontend`)**: Next.js App Router providing real-time dashboards for parents, children, and system administrators.
- **Android Node (`/android`)**: An Android client running a robust Foreground Service to continuously transmit battery, network, location, and system telemetry to the backend.

## The Android Node
The Drishti Node is designed for ultra-resiliency. The background Foreground Service utilizes `android:stopWithTask="false"` and an `AlarmManager` respawn hook to ensure tracking and telemetry persists even if the app is forcefully killed or swiped away from Recents by the user or an aggressive Android battery manager.

## Real-Time Telemetry & WebSockets
Data such as location, battery health, and network state is streamed via WebSockets. Both the Android Node and the Frontend Dashboard establish continuous connections with the backend `SessionManager`. 

## Root Admin Panel

Drishti features a comprehensive Root Admin Panel for overseeing all platform usage.

### Backend (`/root/*` endpoints)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/root/login` | POST | Validate root password (`claudewashere`) |
| `/root/overview` | GET | Stats: total parents, children, linked, sharing |
| `/root/parents` | GET | All parents with full linked-children detail |
| `/root/children` | GET | All children with parent names, locations |
| `/root/change-password` | POST | Reset any parent/child password |
| `/root/child/{id}/location` | GET | Detailed location for a specific child |
| `/root/traffic` | GET | View all active WebSocket sessions, Android nodes, and frontend dashboards connected in real-time |

All endpoints (except login) require the `x-root-token` header.

### Frontend (`/root`)
- **Login screen** — password = `claudewashere`
- **Stats dashboard** — cards showing total parents, children, linked, unlinked, actively sharing
- **Parents / Children tabs** — expandable cards for each user showing locations, sharing status (LIVE badge), and parent linkages.
- **Password change** — modal to reset any user's password.

## CI/CD Pipeline
- **`main` / `develop`**: The primary deployment branches. Merging PRs into `main` automatically triggers production builds for the Android APK (`android-build.yml` via GitHub Actions), the Vercel Frontend, and the Render Backend.