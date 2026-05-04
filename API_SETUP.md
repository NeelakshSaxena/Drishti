# API Setup Guide

This guide explains how to set up the Drishti backend and frontend so the API works correctly in local development and in deployment.

## Overview

Drishti uses a FastAPI backend and a Next.js frontend.

- Backend serves the REST API and persists data in `backend/data/storage.json`.
- Frontend calls the backend through `NEXT_PUBLIC_API_BASE_URL`.
- CORS must allow the frontend origin, or browser requests will fail.

## Local Development Setup

### 1. Backend

Start the backend from the `backend` folder:

```bash
cd backend
python -m venv ../venv
../venv/Scripts/Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend URLs:

- Root: `http://localhost:8000/`
- Health: `http://localhost:8000/health`
- API docs: `http://localhost:8000/docs`

### 2. Frontend

Start the frontend from the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:3000`

### 3. Frontend API Base URL

Create `frontend/.env.local` with:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

This value is read by `frontend/lib/api.ts`.

## Backend Configuration

### CORS

The backend reads `CORS_ORIGINS` from the environment.

Example local configuration:

```bash
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Example production configuration:

```bash
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

If CORS does not include the frontend origin, browser requests will be blocked even if the backend is running.

### Backend environment variables

Recommended variables:

```bash
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

If you use any optional backend integrations in the future, add them here as well.

## Frontend Configuration

### API access

The frontend API client builds requests from `NEXT_PUBLIC_API_BASE_URL`.

If the variable is missing, the client falls back to `http://127.0.0.1:8000`.

Recommended local setting:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Recommended production setting:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

### Important notes

- `NEXT_PUBLIC_*` variables are exposed to the browser.
- Update the value whenever the backend URL changes.
- Restart the frontend dev server after changing `.env.local`.

## API Endpoints Used By The Frontend

The frontend expects these backend routes:

- `GET /health`
- `GET /parent/children`
- `POST /parent/create-child`
- `GET /parent/child/{id}`
- `POST /child/{id}/trip/start`
- `POST /child/{id}/trip/end`
- `POST /trip/{id}/event/add`
- `POST /trip/{id}/event/next`
- `POST /child/{id}/location/update`

Legacy endpoints are also available under `/process`.

## Correct Request Flow

### Local flow

1. Start the backend on port `8000`.
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in the frontend.
3. Make sure backend CORS includes `http://localhost:3000`.
4. Start the frontend on port `3000`.
5. Open the frontend and confirm the health indicator turns green.

### Deployment flow

1. Deploy the backend first.
2. Copy the backend URL into `NEXT_PUBLIC_API_BASE_URL` on the frontend.
3. Add the frontend URL to backend `CORS_ORIGINS`.
4. Redeploy the frontend after the environment variable change.

## Deployment Setup

### Backend on Render

Use these settings:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
- Runtime: Python 3.10+

Example environment variables:

```bash
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

### Frontend on Vercel

Use these settings:

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`

Example environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

After the frontend is deployed, update the backend `CORS_ORIGINS` again if the Vercel URL changes.

## Validation Checklist

Use this checklist to confirm the API is wired correctly:

- Backend responds at `GET /`
- Backend health responds at `GET /health`
- Frontend can load without console CORS errors
- Creating a child works from the dashboard
- Trip start and end actions work
- Event creation works
- Location updates work
- `storage.json` updates after API actions

## Troubleshooting

### Frontend cannot reach backend

Check these first:

- `NEXT_PUBLIC_API_BASE_URL` points to the correct backend URL
- Backend is running
- Backend CORS includes the frontend origin
- The backend URL is reachable in the browser

### CORS errors in the browser

This usually means the backend is missing the frontend origin in `CORS_ORIGINS`.

Example fix:

```bash
CORS_ORIGINS=http://localhost:3000,https://your-vercel-app.vercel.app
```

### Health indicator stays red

Check:

- Backend process is running
- `/health` returns `200`
- The frontend is pointing at the right backend URL

### Requests succeed in Postman but fail in the browser

This is usually a CORS issue, not an API issue.

### Deployed frontend still calls localhost

Make sure `NEXT_PUBLIC_API_BASE_URL` was set in Vercel before the build, then redeploy.

## Summary

For local development, the important setup is:

- Backend on `http://localhost:8000`
- Frontend on `http://localhost:3000`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- `CORS_ORIGINS=http://localhost:3000`

For production, the important setup is:

- Backend deployed first
- Frontend points to the deployed backend URL
- Backend CORS allows the deployed frontend URL
- Frontend is rebuilt after environment changes
