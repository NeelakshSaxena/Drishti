

## Root Admin Panel — Complete

### Backend (`/root/*` endpoints)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/root/login` | POST | Validate root password (`claudewashere`) |
| `/root/overview` | GET | Stats: total parents, children, linked, sharing |
| `/root/parents` | GET | All parents with full linked-children detail |
| `/root/children` | GET | All children with parent names, locations |
| `/root/change-password` | POST | Reset any parent/child password |
| `/root/child/{id}/location` | GET | Detailed location for a specific child |

All endpoints (except login) require the `x-root-token` header.

### Frontend (`/root`)
- **Login screen** — red-accented theme with password input, password = `claudewashere`
- **Stats dashboard** — cards showing total parents, children, linked, unlinked, actively sharing
- **Parents tab** — expandable cards showing each parent's email, ID, linked children with their locations
- **Children tab** — expandable cards with location coordinates, sharing status (LIVE badge), parent linkage
- **Password change** — modal to reset any user's password with show/hide toggle
- Session persists in `sessionStorage` (cleared on tab close)