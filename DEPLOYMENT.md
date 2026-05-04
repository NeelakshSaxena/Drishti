# Deployment Guide

This project is split across two platforms:

- Backend API on Render
- Frontend UI on Vercel

The two services must be linked through environment variables:

- The frontend must know the public backend URL.
- The backend must allow the public frontend origin through CORS.

## 1. Deploy the backend to Render

Use the root `render.yaml`, or create a new Render Web Service manually.

### Render service settings

- Root directory: `backend`
- Runtime: Python 3.10+
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`

### Render environment variables

Set these in the Render dashboard:

```text
CORS_ORIGINS=https://your-vercel-app.vercel.app
AVIATION_STACK_KEY=your_aviationstack_key
```

Notes:

- `CORS_ORIGINS` must contain the exact Vercel production URL.
- If you have a preview domain or custom domain, add it here too.
- `AVIATION_STACK_KEY` is only needed if you use the aviation stack integration.

### Backend verification

After deployment, confirm these URLs work:

```text
https://your-render-service.onrender.com/
https://your-render-service.onrender.com/health
https://your-render-service.onrender.com/docs
```

If `/docs` opens, the backend is reachable and the API is live.

## 2. Deploy the frontend to Vercel

Import the same GitHub repository into Vercel.

### Vercel project settings

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`

### Vercel environment variables

Set the backend URL here:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

This value is read by the frontend API client in `frontend/lib/api.ts`.

Important:

- `NEXT_PUBLIC_API_BASE_URL` must point to the Render backend URL.
- Use the public Render URL, not `localhost`.
- Redeploy the frontend whenever this value changes.

## 3. Link the two services correctly

Use this connection pattern:

1. Deploy the backend on Render first.
2. Copy the public Render URL.
3. Set `NEXT_PUBLIC_API_BASE_URL` in Vercel to that Render URL.
4. Copy the public Vercel URL.
5. Set `CORS_ORIGINS` in Render to include that Vercel URL.
6. Redeploy both services if either environment variable changes.

Example:

```text
Render backend:  https://drishti-backend.onrender.com
Vercel frontend: https://drishti-frontend.vercel.app
```

Then configure:

```text
Vercel NEXT_PUBLIC_API_BASE_URL=https://drishti-backend.onrender.com
Render CORS_ORIGINS=https://drishti-frontend.vercel.app
```

## 4. Local to production mapping

Local development usually uses:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

Production uses:

```text
Frontend: https://your-vercel-app.vercel.app
Backend:  https://your-render-service.onrender.com
```

The frontend should always call the backend through the public backend URL.

## 5. Final verification checklist

After both deployments are live, verify the following:

1. Open the Vercel URL in a browser.
2. Confirm the page loads without console errors.
3. Confirm the health indicator shows the backend is reachable.
4. Create a child from the UI.
5. Start a trip and confirm the backend stores it.
6. Add or advance an event and confirm the UI updates.
7. Refresh the page and confirm the data persists.
8. Check the browser console for CORS errors.

## 6. Troubleshooting

### Frontend shows backend unavailable

Check these first:

- `NEXT_PUBLIC_API_BASE_URL` is set to the Render URL.
- The Render service is running.
- The backend `/health` endpoint responds successfully.

### Browser shows a CORS error

This means the frontend origin is missing from Render CORS settings.

Fix it by adding the exact Vercel URL to `CORS_ORIGINS`.

Example:

```text
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

### Frontend still calls localhost after deployment

This means the Vercel environment variable was not updated before build.

Fix:

1. Update `NEXT_PUBLIC_API_BASE_URL` in Vercel.
2. Redeploy the frontend.
3. Hard refresh the browser.

### Backend works in Postman but not in the browser

That is almost always a CORS problem, not an API problem.

## 7. Summary

Use this final wiring:

```text
Render backend URL -> set as NEXT_PUBLIC_API_BASE_URL in Vercel
Vercel frontend URL -> add to CORS_ORIGINS in Render
```

That is the required link between the backend and frontend for this project.
