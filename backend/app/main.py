import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import process

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


def get_cors_origins():
    origins = os.getenv("CORS_ORIGINS")
    if not origins:
        return DEFAULT_CORS_ORIGINS
    return [origin.strip() for origin in origins.split(",") if origin.strip()]


app = FastAPI(
    title="Drishti API",
    version="0.1.0",
    description="API layer over the Drishti service layer.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(process.router, prefix="/process", tags=["process"])


@app.get("/")
def root():
    return {"status": "ok", "service": "drishti-api"}
