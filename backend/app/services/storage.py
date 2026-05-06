"""
PostgreSQL storage for family tracking system (Supabase).
Manages parents, children, linking codes, and trips.

Migrated from SQLite to PostgreSQL for persistent storage on Render/Supabase.
"""

from datetime import timedelta

import hashlib
import json
import os
import socket
import uuid
import logging
import string
import random
from datetime import datetime
from typing import Any

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Load .env from the backend directory
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
load_dotenv(os.path.join(_backend_dir, ".env"))

logger = logging.getLogger(__name__)

# Database connection parameters from environment
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")

if not DB_HOST or not DB_PASSWORD:
    raise RuntimeError(
        "DB_HOST and DB_PASSWORD environment variables must be set. "
        "Please set them in backend/.env or as environment variables on your host."
    )


def _resolve_db_addresses() -> list[str]:
    """Resolve the DB host and prefer IPv4 addresses if available."""
    addresses = []
    try:
        addresses = [
            addr[4][0]
            for addr in socket.getaddrinfo(
                DB_HOST,
                DB_PORT,
                family=socket.AF_UNSPEC,
                type=socket.SOCK_STREAM,
            )
        ]
    except socket.gaierror:
        return []

    # Prefer IPv4 first, then IPv6.
    ipv4 = [addr for addr in addresses if "." in addr]
    ipv6 = [addr for addr in addresses if ":" in addr]
    return ipv4 + ipv6


def get_db():
    """Return a new PostgreSQL connection."""
    addresses = _resolve_db_addresses()
    if not addresses:
        raise RuntimeError(
            f"Unable to resolve DB_HOST={DB_HOST}. "
            "Check your network/DNS or env configuration."
        )

    last_error = None
    for addr in addresses:
        try:
            conn = psycopg2.connect(
                host=addr,
                port=DB_PORT,
                dbname=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                sslmode="require",
            )
            conn.autocommit = False
            return conn
        except Exception as exc:
            last_error = exc

    raise last_error


def _execute(query: str, params: tuple = (), *, fetch: str = "none") -> Any:
    """
    Helper: run a single query, commit, and optionally fetch results.
    fetch: "none" | "one" | "all"
    """
    conn = get_db()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(query, params)
            if fetch == "one":
                result = cur.fetchone()
            elif fetch == "all":
                result = cur.fetchall()
            else:
                result = None
        conn.commit()
        return result
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def hash_password(password: str) -> str:
    """SHA-256 hash of the password."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def ensure_data_dir():
    """Create tables if they don't exist (PostgreSQL DDL)."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('''
                CREATE TABLE IF NOT EXISTS parents (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    password TEXT,
                    linked_children TEXT,
                    created_at TEXT
                )
            ''')
            cur.execute('''
                CREATE TABLE IF NOT EXISTS children (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    password TEXT,
                    age INTEGER,
                    child_code TEXT UNIQUE,
                    parent_id TEXT,
                    current_trip TEXT,
                    trip_history TEXT,
                    created_at TEXT,
                    lat DOUBLE PRECISION,
                    lon DOUBLE PRECISION,
                    share_token TEXT
                )
            ''')
        conn.commit()
        logger.info("Database tables ensured.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def migrate_db():
    """Migrate existing tables – add new columns if they don't exist."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            new_cols = [
                ("parents",  "password", "TEXT"),
                ("children", "password", "TEXT"),
                ("children", "share_token", "TEXT"),
                ("children", "share_token_expires_at", "TEXT"),
                ("children", "is_sharing", "INTEGER DEFAULT 0"),
                ("children", "location_updated_at", "TEXT"),
            ]
            for table, col_name, col_type in new_cols:
                try:
                    cur.execute(
                        f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col_name} {col_type}"
                    )
                except psycopg2.Error:
                    conn.rollback()
        conn.commit()
        logger.info("Database migration complete.")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# Initialize DB on load
ensure_data_dir()
migrate_db()


def generate_child_code() -> str:
    """Generate a unique 6-character child code."""
    chars = string.ascii_uppercase + string.digits
    conn = get_db()
    try:
        with conn.cursor() as cur:
            while True:
                code = ''.join(random.choices(chars, k=6))
                cur.execute('SELECT id FROM children WHERE child_code = %s', (code,))
                if not cur.fetchone():
                    return code
    finally:
        conn.close()


def generate_share_token() -> str:
    """Generate a unique share token for guest view."""
    return uuid.uuid4().hex  # 32-char hex


def load_storage():
    """No-op for PostgreSQL (tables are created in ensure_data_dir)."""
    pass


def save_storage():
    """No-op for PostgreSQL (data is committed per-operation)."""
    pass


def clear_all():
    """Clear all storage (for testing)."""
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM parents')
            cur.execute('DELETE FROM children')
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


# Helper to deserialize Row to dict
def parent_row_to_dict(row):
    if not row:
        return None
    d = dict(row)
    d['linked_children'] = json.loads(d['linked_children']) if d['linked_children'] else []
    return d


def child_row_to_dict(row):
    if not row:
        return None
    d = dict(row)
    d['current_trip'] = json.loads(d['current_trip']) if d['current_trip'] else None
    d['trip_history'] = json.loads(d['trip_history']) if d['trip_history'] else []
    return d


# ── Parent operations ──────────────────────────────────────────────────────────

def create_parent(name: str | None = None, email: str | None = None,
                  password: str | None = None) -> dict[str, Any]:
    parent_id = str(uuid.uuid4())
    pw_hash = hash_password(password) if password else None
    parent = {
        "id": parent_id,
        "name": name,
        "email": email,
        "password": pw_hash,
        "linked_children": [],
        "created_at": datetime.utcnow().isoformat(),
    }
    _execute(
        'INSERT INTO parents (id, name, email, password, linked_children, created_at) VALUES (%s, %s, %s, %s, %s, %s)',
        (parent["id"], parent["name"], parent["email"], parent["password"],
         json.dumps(parent["linked_children"]), parent["created_at"])
    )
    logger.info(f"Created parent: {parent_id} ({name})")
    return parent


def get_parent(parent_id: str) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM parents WHERE id = %s', (parent_id,), fetch="one")
    return parent_row_to_dict(row)


def find_parent_by_email(email: str) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM parents WHERE email = %s', (email,), fetch="one")
    return parent_row_to_dict(row)


def find_parent_by_name_and_email(name: str | None, email: str,
                                   password: str | None = None) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM parents WHERE email = %s', (email,), fetch="one")
    parent = parent_row_to_dict(row)
    if not parent:
        return None
    # If account has a password, verify it
    if parent.get("password") and password:
        if parent["password"] != hash_password(password):
            return None  # Wrong password
    # If account has a password but none provided, deny
    elif parent.get("password") and not password:
        return None
    return parent


# ── Child operations ──────────────────────────────────────────────────────────

def create_child(name: str | None = None, email: str | None = None,
                 age: int | None = None, password: str | None = None) -> dict[str, Any]:
    child_id = str(uuid.uuid4())
    child_code = generate_child_code()
    pw_hash = hash_password(password) if password else None

    child = {
        "id": child_id,
        "name": name,
        "email": email,
        "password": pw_hash,
        "age": age,
        "child_code": child_code,
        "parent_id": None,
        "current_trip": None,
        "trip_history": [],
        "created_at": datetime.utcnow().isoformat(),
        "lat": None,
        "lon": None,
        "share_token": None,
    }
    _execute(
        'INSERT INTO children (id, name, email, password, age, child_code, parent_id, '
        'current_trip, trip_history, created_at, lat, lon, share_token) '
        'VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)',
        (child["id"], child["name"], child["email"], child["password"], child["age"],
         child["child_code"], child["parent_id"],
         json.dumps(child["current_trip"]), json.dumps(child["trip_history"]),
         child["created_at"], child["lat"], child["lon"], child["share_token"])
    )
    logger.info(f"Created child: {child_id} ({name}) with code: {child_code}")
    return child


def get_child(child_id: str) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM children WHERE id = %s', (child_id,), fetch="one")
    return child_row_to_dict(row)


def find_child_by_email(email: str, password: str | None = None) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM children WHERE email = %s', (email,), fetch="one")
    child = child_row_to_dict(row)
    if not child:
        return None
    if child.get("password") and password:
        if child["password"] != hash_password(password):
            return None
    elif child.get("password") and not password:
        return None
    return child


def find_child_by_name(name: str) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM children WHERE name = %s', (name,), fetch="one")
    return child_row_to_dict(row)


def get_child_by_code(code: str) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM children WHERE child_code = %s', (code,), fetch="one")
    return child_row_to_dict(row)


def get_child_by_share_token(token: str) -> dict[str, Any] | None:
    row = _execute('SELECT * FROM children WHERE share_token = %s', (token,), fetch="one")
    child = child_row_to_dict(row)
    if not child:
        return None
    # Check expiry
    expires_at = child.get("share_token_expires_at")
    if expires_at:
        try:
            if datetime.utcnow() > datetime.fromisoformat(expires_at):
                return None  # Expired
        except ValueError:
            pass
    return child


def create_share_token(child_id: str) -> str:
    """Generate a fresh share token for a child and persist it (expires in 48h)."""
    token = generate_share_token()
    expires_at = (datetime.utcnow() + timedelta(hours=48)).isoformat()
    _execute(
        'UPDATE children SET share_token = %s, share_token_expires_at = %s WHERE id = %s',
        (token, expires_at, child_id)
    )
    return token, expires_at


def stop_sharing(child_id: str):
    """Mark child as not actively sharing location."""
    _execute('UPDATE children SET is_sharing = 0 WHERE id = %s', (child_id,))


# ── Location ──────────────────────────────────────────────────────────────────

def update_child_location(child_id: str, lat: float, lon: float):
    now = datetime.utcnow().isoformat()
    _execute(
        'UPDATE children SET lat = %s, lon = %s, is_sharing = 1, location_updated_at = %s WHERE id = %s',
        (lat, lon, now, child_id)
    )


# ── Linking operations ────────────────────────────────────────────────────────

def link_child_to_parent(parent_id: str, child_code: str) -> tuple[bool, str]:
    parent = get_parent(parent_id)
    if not parent:
        return False, "Parent not found"

    child = get_child_by_code(child_code)
    if not child:
        return False, "Child code not found"

    child_id = child["id"]
    if child["parent_id"] is not None:
        return False, "Child already linked to another parent"

    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute('UPDATE children SET parent_id = %s WHERE id = %s', (parent_id, child_id))
            parent["linked_children"].append(child_id)
            cur.execute('UPDATE parents SET linked_children = %s WHERE id = %s',
                        (json.dumps(parent["linked_children"]), parent_id))
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    logger.info(f"Linked child {child_id} to parent {parent_id}")
    return True, "Child linked successfully"


# ── Trip operations ───────────────────────────────────────────────────────────

def start_trip(child_id: str) -> dict[str, Any] | None:
    child = get_child(child_id)
    if not child:
        return None

    trip = {
        "id": str(uuid.uuid4()),
        "events": [],
        "status": "active",
        "started_at": datetime.utcnow().isoformat(),
        "ended_at": None,
    }

    _execute(
        'UPDATE children SET current_trip = %s WHERE id = %s',
        (json.dumps(trip), child_id)
    )
    return trip


def add_event_to_trip(child_id: str, event_data: dict[str, Any]) -> dict[str, Any] | None:
    child = get_child(child_id)
    if not child or not child["current_trip"]:
        return None

    event = {
        "id": str(uuid.uuid4()),
        "type": event_data.get("type"),
        "from_location": event_data.get("from_location"),
        "to_location": event_data.get("to_location"),
        "time": event_data.get("time"),
        "description": event_data.get("description", ""),
        "created_at": datetime.utcnow().isoformat(),
    }

    child["current_trip"]["events"].append(event)
    _execute(
        'UPDATE children SET current_trip = %s WHERE id = %s',
        (json.dumps(child["current_trip"]), child_id)
    )
    return event


def end_trip(child_id: str) -> bool:
    child = get_child(child_id)
    if not child or not child["current_trip"]:
        return False

    trip = child["current_trip"]
    trip["status"] = "ended"
    trip["ended_at"] = datetime.utcnow().isoformat()

    child["trip_history"].append(trip)
    _execute(
        'UPDATE children SET current_trip = %s, trip_history = %s WHERE id = %s',
        (json.dumps(None), json.dumps(child["trip_history"]), child_id)
    )
    return True


# ── Dashboard helpers ─────────────────────────────────────────────────────────

def get_parent_dashboard(parent_id: str) -> dict[str, Any] | None:
    parent = get_parent(parent_id)
    if not parent:
        return None

    linked_children = []
    for child_id in parent["linked_children"]:
        child = get_child(child_id)
        if child:
            linked_children.append(child)

    return {
        "parent": parent,
        "linked_children": linked_children,
    }


def get_child_dashboard(child_id: str) -> dict[str, Any] | None:
    child = get_child(child_id)
    if not child:
        return None

    parent_name = None
    if child["parent_id"]:
        parent = get_parent(child["parent_id"])
        if parent:
            parent_name = parent.get("name")

    return {
        "child": child,
        "current_trip": child["current_trip"],
        "trip_history": child["trip_history"],
        "parent_name": parent_name,
    }


def is_healthy() -> bool:
    """Check if the database is reachable."""
    try:
        _execute("SELECT 1", fetch="one")
        return True
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        return False
