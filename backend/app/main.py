import os
import logging
import sys

from dotenv import load_dotenv

# Load .env from the backend directory (one level up from app/)
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(_backend_dir, ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import process, management, family, admin, device
from app.services import storage
from app.gateway import ws

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Drishti API",
    version="0.1.0",
    description="Family trip tracking API.",
)

# Allow all origins so the Vercel frontend can reach the Render backend.
# Restrict to specific origins via the CORS_ORIGINS env var on Render if needed.
allowed_origins_env = os.getenv("CORS_ORIGINS", "")
if allowed_origins_env:
    allow_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
    allow_credentials = True
else:
    allow_origins = ["*"]
    allow_credentials = False  # wildcard + credentials is not allowed by spec

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(process.router, prefix="/process", tags=["process"])
app.include_router(management.router, tags=["management"])
app.include_router(family.router, prefix="/family", tags=["family"])
app.include_router(admin.router, prefix="/root", tags=["admin"])
app.include_router(device.router, prefix="/device", tags=["device"])
app.include_router(ws.router, prefix="/ws", tags=["device-gateway"])

@app.on_event("startup")
def startup_event():
    """Initialize storage on startup."""
    logger.info("Starting Drishti API...")
    try:
        storage.load_storage()
        logger.info("Storage loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load storage: {e}")


@app.get("/")
def root():
    return {"status": "ok", "service": "drishti-api", "version": "0.1.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
