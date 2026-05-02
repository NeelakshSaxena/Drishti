drishti/
│
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   ├── process.py
│   │   ├── services/
│   │   │   ├── processing.py
│   │   ├── models/
│   │   │   ├── schemas.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   ├── utils/
│   │
│   ├── requirements.txt
│   ├── Dockerfile (optional)
│
├── frontend/                # Next.js + Tailwind
│   ├── app/ (or pages/)
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │
│   ├── components/
│   │   ├── MapView.tsx
│   │   ├── InputPanel.tsx
│   │   ├── ResultsPanel.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │
│   ├── styles/
│   ├── public/
│   ├── package.json
│
├── .env
├── README.md