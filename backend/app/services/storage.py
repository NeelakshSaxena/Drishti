"""
SQLite storage for family tracking system.
Manages parents, children, linking codes, and trips.
"""

from datetime import timedelta

import hashlib
import json
import os
import uuid
import logging
import string
import random
import sqlite3
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)

# Data file paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
STORAGE_FILE = os.path.join(DATA_DIR, "drishti.db")


def get_db():
    conn = sqlite3.connect(STORAGE_FILE, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password: str) -> str:
    """SHA-256 hash of the password."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def ensure_data_dir():
    """Create data directory and tables if they don't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = get_db()
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS parents (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            password TEXT,
            linked_children TEXT,
            created_at TEXT
        )
    ''')
    c.execute('''
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
            lat REAL,
            lon REAL,
            share_token TEXT
        )
    ''')
    conn.commit()
    conn.close()


def migrate_db():
    """Migrate existing tables – add new columns if they don't exist."""
    conn = get_db()
    c = conn.cursor()
    new_cols = [
        ("parents",  "password TEXT"),
        ("children", "password TEXT"),
        ("children", "share_token TEXT"),
        ("children", "share_token_expires_at TEXT"),
        ("children", "is_sharing INTEGER DEFAULT 0"),
        ("children", "location_updated_at TEXT"),
    ]
    for table, col_def in new_cols:
        try:
            c.execute(f"ALTER TABLE {table} ADD COLUMN {col_def}")
        except sqlite3.OperationalError:
            pass  # Column already exists
    conn.commit()
    conn.close()


# Initialize DB on load
ensure_data_dir()
migrate_db()


def generate_child_code() -> str:
    """Generate a unique 6-character child code."""
    chars = string.ascii_uppercase + string.digits
    conn = get_db()
    c = conn.cursor()
    while True:
        code = ''.join(random.choices(chars, k=6))
        c.execute('SELECT id FROM children WHERE child_code = ?', (code,))
        if not c.fetchone():
            conn.close()
            return code


def generate_share_token() -> str:
    """Generate a unique share token for guest view."""
    return uuid.uuid4().hex  # 32-char hex


def load_storage():
    """No-op for sqlite."""
    pass


def save_storage():
    """No-op for sqlite."""
    pass


def clear_all():
    """Clear all in-memory storage (for testing)."""
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM parents')
    c.execute('DELETE FROM children')
    conn.commit()
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
    conn = get_db()
    conn.execute(
        'INSERT INTO parents (id, name, email, password, linked_children, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        (parent["id"], parent["name"], parent["email"], parent["password"],
         json.dumps(parent["linked_children"]), parent["created_at"])
    )
    conn.commit()
    conn.close()
    logger.info(f"Created parent: {parent_id} ({name})")
    return parent


def get_parent(parent_id: str) -> dict[str, Any] | None:
    conn = get_db()
    c = conn.execute('SELECT * FROM parents WHERE id = ?', (parent_id,))
    row = c.fetchone()
    conn.close()
    return parent_row_to_dict(row)


def find_parent_by_email(email: str) -> dict[str, Any] | None:
    conn = get_db()
    c = conn.execute('SELECT * FROM parents WHERE email = ?', (email,))
    row = c.fetchone()
    conn.close()
    return parent_row_to_dict(row)


def find_parent_by_name_and_email(name: str | None, email: str,
                                   password: str | None = None) -> dict[str, Any] | None:
    conn = get_db()
    c = conn.execute('SELECT * FROM parents WHERE email = ?', (email,))
    row = c.fetchone()
    conn.close()
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
    conn = get_db()
    conn.execute(
        'INSERT INTO children (id, name, email, password, age, child_code, parent_id, '
        'current_trip, trip_history, created_at, lat, lon, share_token) '
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        (child["id"], child["name"], child["email"], child["password"], child["age"],
         child["child_code"], child["parent_id"],
         json.dumps(child["current_trip"]), json.dumps(child["trip_history"]),
         child["created_at"], child["lat"], child["lon"], child["share_token"])
    )
    conn.commit()
    conn.close()
    logger.info(f"Created child: {child_id} ({name}) with code: {child_code}")
    return child


def get_child(child_id: str) -> dict[str, Any] | None:
    conn = get_db()
    c = conn.execute('SELECT * FROM children WHERE id = ?', (child_id,))
    row = c.fetchone()
    conn.close()
    return child_row_to_dict(row)


def find_child_by_email(email: str, password: str | None = None) -> dict[str, Any] | None:
    conn = get_db()
    c = conn.execute('SELECT * FROM children WHERE email = ?', (email,))
    row = c.fetchone()
    conn.close()
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
    conn = get_db()
    c = conn.execute('SELECT * FROM children WHERE name = ?', (name,))
    row = c.fetchone()
    conn.close()
    return child_row_to_dict(row)


def get_child_by_code(code: str) -> dict[str, Any] | None:
    conn = get_db()
    c = conn.execute('SELECT * FROM children WHERE child_code = ?', (code,))
    row = c.fetchone()
    conn.close()
    return child_row_to_dict(row)


def get_child_by_share_token(token: str) -> dict[str, Any] | None:
    conn = get_db()
    c = conn.execute('SELECT * FROM children WHERE share_token = ?', (token,))
    row = c.fetchone()
    conn.close()
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
    conn = get_db()
    conn.execute(
        'UPDATE children SET share_token = ?, share_token_expires_at = ? WHERE id = ?',
        (token, expires_at, child_id)
    )
    conn.commit()
    conn.close()
    return token, expires_at


def stop_sharing(child_id: str):
    """Mark child as not actively sharing location."""
    conn = get_db()
    conn.execute('UPDATE children SET is_sharing = 0 WHERE id = ?', (child_id,))
    conn.commit()
    conn.close()


# ── Location ──────────────────────────────────────────────────────────────────

def update_child_location(child_id: str, lat: float, lon: float):
    now = datetime.utcnow().isoformat()
    conn = get_db()
    conn.execute(
        'UPDATE children SET lat = ?, lon = ?, is_sharing = 1, location_updated_at = ? WHERE id = ?',
        (lat, lon, now, child_id)
    )
    conn.commit()
    conn.close()


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
    conn.execute('UPDATE children SET parent_id = ? WHERE id = ?', (parent_id, child_id))
    parent["linked_children"].append(child_id)
    conn.execute('UPDATE parents SET linked_children = ? WHERE id = ?',
                 (json.dumps(parent["linked_children"]), parent_id))
    conn.commit()
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

    conn = get_db()
    conn.execute('UPDATE children SET current_trip = ? WHERE id = ?',
                 (json.dumps(trip), child_id))
    conn.commit()
    conn.close()
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
    conn = get_db()
    conn.execute('UPDATE children SET current_trip = ? WHERE id = ?',
                 (json.dumps(child["current_trip"]), child_id))
    conn.commit()
    conn.close()
    return event


def end_trip(child_id: str) -> bool:
    child = get_child(child_id)
    if not child or not child["current_trip"]:
        return False

    trip = child["current_trip"]
    trip["status"] = "ended"
    trip["ended_at"] = datetime.utcnow().isoformat()

    child["trip_history"].append(trip)
    conn = get_db()
    conn.execute(
        'UPDATE children SET current_trip = ?, trip_history = ? WHERE id = ?',
        (json.dumps(None), json.dumps(child["trip_history"]), child_id)
    )
    conn.commit()
    conn.close()
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
    try:
        ensure_data_dir()
        return True
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        return False
