# Drishti - Child Trip Management System

Complete full-stack implementation of a child trip tracking and management system with real-time health monitoring, location tracking, and event management.

## 🎯 What is Drishti?

Drishti is a parent-child trip management system that allows parents to create child profiles, manage trips, track locations, and monitor events in real-time. Features include:

- **Parent Dashboard** - Manage multiple children and their trips
- **Trip Management** - Start, end, and track trips with events
- **Event Tracking** - Add and advance through trip events (flights, trains, buses, etc.)
- **Location Tracking** - Real-time location updates
- **Health Monitoring** - Backend status indicator with auto-refresh
- **Dark Mode** - Toggle between light and dark themes
- **Full Stack** - FastAPI backend with Next.js frontend

## ✨ Key Features

✅ Parent-child management  
✅ Trip lifecycle (start → events → end)  
✅ Event management (flights, trains, buses, hotels, etc.)  
✅ Real-time location tracking  
✅ Backend health indicator  
✅ Dark mode support  
✅ Auto-refresh every 15 seconds  
✅ Error handling with retry logic  
✅ JSON data persistence  
✅ Type-safe API (TypeScript + Pydantic)  
✅ Responsive design  
✅ Backward compatible with legacy flow  

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Start Backend
```bash
cd backend
python -m venv ../venv
../venv/Scripts/Activate.ps1  # Windows
source ../venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend: http://localhost:8000  
API Docs: http://localhost:8000/docs  
Health: http://localhost:8000/health

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

## 📊 Architecture

```
Next.js Frontend (React + TypeScript + Tailwind)
         ↓ (REST API with retry logic)
FastAPI Backend (Python + Pydantic)
         ↓ (CRUD operations)
In-Memory Storage with JSON Persistence
```

## 📁 Project Structure

```
Drishti/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app setup
│   │   ├── models/schemas.py    # Pydantic models
│   │   ├── routes/
│   │   │   ├── process.py       # Legacy endpoints
│   │   │   └── management.py    # New endpoints
│   │   └── services/
│   │       ├── processing.py    # Legacy logic
│   │       └── storage.py       # In-memory storage
│   ├── data/
│   │   └── storage.json         # Persisted data
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main dashboard
│   │   ├── legacy/page.tsx      # Legacy page
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── HealthIndicator.tsx
│   │   ├── ParentDashboard.tsx
│   │   ├── ChildPanel.tsx
│   │   ├── MapView.tsx
│   │   └── ...
│   ├── lib/api.ts               # API client
│   └── package.json
├── API_DOCUMENTATION.md         # Backend reference
├── FRONTEND_INTEGRATION.md      # Frontend guide
└── INTEGRATION_SUMMARY.md       # Complete overview
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Backend status |
| POST | `/parent/create-child` | Create child |
| GET | `/parent/children` | List children |
| GET | `/parent/child/{id}` | Get specific child |
| POST | `/child/{id}/trip/start` | Start trip |
| POST | `/child/{id}/trip/end` | End trip |
| POST | `/trip/{id}/event/add` | Add event |
| POST | `/trip/{id}/event/next` | Advance event |
| POST | `/child/{id}/location/update` | Update location |

## 🎨 UI Components

### Pages
- **Main Dashboard** (`app/page.tsx`) - Parent view with children list or child view with trip management
- **Legacy Page** (`app/legacy/page.tsx`) - Backward compatible old flow

### Components
- **HealthIndicator** - Real-time backend status (🟢🔴⚠️)
- **ParentDashboard** - Children management
- **ChildPanel** - Trip and event management
- **MapView** - Route visualization
- **InputPanel** - Legacy trip input
- **ResultsPanel** - Legacy results display

## 📝 Workflow

1. **Create Child** - Enter name, get UUID
2. **Start Trip** - Initializes empty event list
3. **Add Events** - Flight, Train, Bus, Car, Hostel, Hotel
4. **Update Location** - Real-time coordinates
5. **Advance Events** - Mark complete, move to next
6. **End Trip** - Complete the trip

## ⚙️ Configuration

### Backend (.env)
```bash
CORS_ORIGINS=http://localhost:3000,https://yourdomain.vercel.app
BACKEND_URL=http://localhost:8000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# For production:
# NEXT_PUBLIC_API_BASE_URL=https://your-backend.render.com
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8000/health
```

### Create Child
```bash
curl -X POST http://localhost:8000/parent/create-child \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```

### List Children
```bash
curl http://localhost:8000/parent/children
```

## 💾 Data Persistence

**File**: `backend/data/storage.json`  
**Format**: JSON (human-readable)  
**Auto-save**: After each operation  
**Auto-load**: On backend startup  

Example structure:
```json
{
  "children": {...},
  "trips": {...},
  "locations": {...}
}
```

## 🌙 Dark Mode

- **Toggle**: Button in header
- **System**: Tailwind class-based dark mode
- **Status**: Persists in React state (per session)
- **Coverage**: Complete theme for all components

## 📱 Responsive Design

Adapts to mobile, tablet, and desktop screens using Tailwind's responsive classes.

## 🚢 Deployment

### Backend (Render)
1. Connect GitHub repository
2. Create Web Service
3. Runtime: Python 3.10
4. Build: `pip install -r backend/requirements.txt`
5. Start: `python -m uvicorn backend.app.main:app --host 0.0.0.0`

### Frontend (Vercel)
1. Connect GitHub repository
2. Root Directory: `frontend`
3. Build: `npm run build`
4. Environment: `NEXT_PUBLIC_API_BASE_URL=<backend-url>`

## 📚 Documentation

- **API_DOCUMENTATION.md** - Complete backend API reference
- **FRONTEND_INTEGRATION.md** - Frontend architecture and components
- **INTEGRATION_SUMMARY.md** - System status and features

## 🆘 Troubleshooting

**Backend not responding**
```bash
curl http://localhost:8000/health
```

**Frontend can't connect to backend**
- Check `NEXT_PUBLIC_API_BASE_URL`
- Verify backend is running
- Check CORS configuration

**Data not persisting**
- Check `backend/data/storage.json` exists
- Verify backend has write permissions
- Check logs in terminal

## 📞 Support

1. Check error messages in UI
2. Review backend logs in terminal
3. Check browser console (F12)
4. Read documentation files

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Tech**: FastAPI + Next.js + TypeScript + Tailwind  
**License**: MIT
