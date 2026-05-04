# Drishti - Family Trip Tracking System

A full-stack application for tracking family trips with parent-child roles. Children can log their journey events (flights, trains, buses, hostels) and parents can monitor their linked children's trips.

## 🎯 Features

- **Role-Based Access**: Separate dashboards for parents and children
- **Code-Based Linking**: Children generate unique 7-character codes for parent linking
- **Trip Management**: Start/end trips and add events with multiple transport types
- **Dark Mode**: Modern dark interface (#0A0A0A base)
- **Real-time Sync**: Instant updates across dashboards
- **Responsive Design**: Works on desktop, tablet, and mobile
- **In-Memory Storage**: Fast performance with JSON file backup

## 🛠 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui Components
- React Hot Toast

**Backend:**
- FastAPI
- Python 3.8+
- In-Memory Storage
- CORS Support

## 📋 Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 📖 Usage

### Child Flow

1. **Initialize**: Click "Login as Child" on the home screen
2. **Get Code**: Your unique code is displayed (e.g., `ABC1D2E`)
3. **Share Code**: Copy and share this code with your parent
4. **Wait for Linking**: Once parent links you, you'll see trip management options
5. **Start Trip**: Click "Start Trip" when beginning your journey
6. **Log Events**: Add events (flight, train, bus, hostel, or custom) with:
   - Event type
   - From location
   - To location
   - Optional time
7. **End Trip**: Click "End Trip" when your journey is complete

### Parent Flow

1. **Initialize**: Click "Login as Parent" on the home screen
2. **Link Child**: Enter your child's code and click "Link Child"
3. **Monitor Trips**: View active trips and past trip history
4. **See Events**: Each trip shows all logged events in timeline format

## 🔌 API Endpoints

### Health Check
- `GET /family/health` - System status

### Child Operations
- `POST /family/child/init` - Create new child (returns child_id and child_code)
- `GET /family/child/dashboard?child_id={id}` - Get child dashboard data
- `POST /family/child/trip/start?child_id={id}` - Start a new trip
- `POST /family/child/trip/event?child_id={id}` - Add event to active trip
- `POST /family/child/trip/end?child_id={id}` - End active trip

### Parent Operations
- `POST /family/parent/init` - Create new parent
- `GET /family/parent/dashboard?parent_id={id}` - Get parent dashboard
- `POST /family/parent/link-child?parent_id={id}` - Link child via code

## 📊 Data Models

### Child
```typescript
{
  id: string;
  child_code: string;                    // 7-char unique code
  parent_id: string | null;              // Linked parent ID
  current_trip: Trip | null;             // Active trip
  trip_history: Trip[];                  // Completed trips
  created_at: string;
}
```

### Trip
```typescript
{
  id: string;
  events: TripEvent[];
  status: "active" | "ended";
  started_at: string;
  ended_at: string | null;
}
```

### TripEvent
```typescript
{
  id: string;
  type: string;              // flight|train|bus|hostel|custom
  from_location: string;
  to_location: string;
  time?: string;
  description: string;
  created_at: string;
}
```

## 🧪 Testing

Run the integration test suite:

```bash
python test_integration.py
```

This will test:
- Health check
- Child and parent initialization
- Child linking
- Trip creation and events
- Dashboard endpoints

## 📁 Project Structure

```
Drishti/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app setup
│   │   ├── models/
│   │   │   ├── schemas.py          # Pydantic models
│   │   ├── routes/
│   │   │   ├── family.py           # Family tracking routes
│   │   │   ├── process.py          # Legacy routes
│   │   │   ├── management.py       # Legacy routes
│   │   ├── services/
│   │   │   └── storage.py          # In-memory storage
│   ├── requirements.txt
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx                # Main page with login/dashboards
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   ├── lib/
│   │   ├── api.ts                  # API client
│   │   ├── utils.ts                # Helper functions
│   ├── .env.local                  # Environment configuration
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│
├── test_integration.py             # Integration tests
└── README.md                        # This file
```

## 🎨 Styling

- **Base Color**: #0A0A0A (True black)
- **Secondary**: #1a1a1a, #404040, #505050 (Dark grays)
- **Text**: #f5f5f5, #e0e0e0 (Light grays)
- **Accent**: Slate colors from Tailwind

## 🔐 Security Notes

- No authentication/authorization (development only)
- In-memory storage clears on server restart
- JSON backup supports persistence across restarts
- CORS enabled for development

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.8+)
- Check ports: Make sure 8000 is available
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check API URL: Ensure .env.local has correct API_URL

### API calls fail
- Check backend is running: `curl http://localhost:8000/family/health`
- Check frontend .env.local configuration
- Check CORS headers in browser console

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚢 Deployment

### Backend (Render/Railway)
```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend (Vercel)
```bash
npm install
npm run build
npm start
```

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Support

For issues or questions, check the integration tests and API documentation.

---

**Built with ❤️ for family trip tracking**
