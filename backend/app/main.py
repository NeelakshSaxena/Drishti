import os
import logging
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import process, management, family
from app.services import storage

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://drishti-phi.vercel.app",
    "https://*.vercel.app",
    "https://vercel.app",
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

# Support wildcard-style origins (e.g. https://*.vercel.app) by converting
# them into a combined regex passed to `allow_origin_regex`. Exact origins
# are passed to `allow_origins` as before.
cors_origins = get_cors_origins()
# Build a combined regex that covers both exact origins and wildcard patterns.
regex_parts = []
for pattern in cors_origins:
    # Escape dots and other regex characters, then convert '*' to '.*'
    # We escape common regex metacharacters first, then replace the literal '*' with '.*'
    p = pattern
    # Escape regex special chars except '*'
    for ch in ".^$+?{}[]|()":
        p = p.replace(ch, f"\\{ch}")
    p = p.replace("*", ".*")
    if not p.startswith("^"):
        p = f"^{p}$"
    regex_parts.append(p)

allow_origin_regex = None
if regex_parts:
    allow_origin_regex = "|".join(regex_parts)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(process.router, prefix="/process", tags=["process"])
app.include_router(management.router, tags=["management"])
app.include_router(family.router, prefix="/family", tags=["family"])


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
