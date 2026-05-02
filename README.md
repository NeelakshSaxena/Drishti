# Drishti

Drishti is a monorepo with a FastAPI backend and a Next.js frontend for trip setup, API response display, and map visualization.

## Structure

- `backend/` - FastAPI app, routes, schemas, and service layer
- `frontend/` - Next.js App Router UI with Tailwind CSS and MapLibre/mapcn
- `logs/` - local runtime JSON state written by the backend service layer
- `phases/` - implementation phase notes

## Local Backend

```bash
cd backend
..\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 10000
```

Local API docs:

```text
http://127.0.0.1:10000/docs
```

Backend environment variables:

```text
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://your-vercel-app.vercel.app
AVIATION_STACK_KEY=your_aviationstack_key
```

## Local Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:10000
```

Open:

```text
http://127.0.0.1:3000
```
