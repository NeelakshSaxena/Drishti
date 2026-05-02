# Deployment

## Backend: Render

Use the root `render.yaml`, or create a Render Web Service manually with:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 10000
```

Render settings:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`

Environment variables:

```text
CORS_ORIGINS=https://your-vercel-app.vercel.app
AVIATION_STACK_KEY=your_aviationstack_key
```

After deploy, verify:

```text
https://your-render-service.onrender.com/docs
```

## Frontend: Vercel

Import the repo into Vercel and set:

- Root directory: `frontend`
- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: `.next`

Environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://your-render-service.onrender.com
```

After Vercel gives you a production URL, add it to the Render backend:

```text
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

## Final Check

1. Open the Vercel URL.
2. Submit the trip form.
3. Confirm the Results panel updates.
4. Confirm the browser console has no CORS errors.
