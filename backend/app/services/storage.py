"""
In-memory storage for family tracking system.
Manages parents, children, linking codes, and trips.
"""

import json
import os
import uuid
import logging
import string
import random
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)

# Data file paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
STORAGE_FILE = os.path.join(DATA_DIR, "storage.json")

# In-memory data stores
parents: dict[str, dict[str, Any]] = {}  # parent_id -> parent data
children: dict[str, dict[str, Any]] = {}  # child_id -> child data
child_codes: dict[str, str] = {}  # child_code -> child_id (for fast lookup)


def ensure_data_dir():
    """Create data directory if it doesn't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)


def generate_child_code() -> str:
    """Generate a unique 7-character child code."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(chars, k=7))
        if code not in child_codes:
            return code


def load_storage():
    """Load data from JSON file into memory."""
    global parents, children, child_codes
    
    if not os.path.exists(STORAGE_FILE):
        logger.info("No storage file found. Starting with empty storage.")
        return

    try:
        with open(STORAGE_FILE, "r") as f:
            data = json.load(f)
            parents = data.get("parents", {})
            children = data.get("children", {})
            # Rebuild child_codes mapping
            for child_id, child_data in children.items():
                if "child_code" in child_data:
                    child_codes[child_data["child_code"]] = child_id
        logger.info(f"Loaded: {len(parents)} parents, {len(children)} children")
    except Exception as e:
        logger.error(f"Failed to load storage: {e}")


def save_storage():
    """Save in-memory data to JSON file."""
    ensure_data_dir()
    
    try:
        data = {
            "parents": parents,
            "children": children,
        }
        with open(STORAGE_FILE, "w") as f:
            json.dump(data, f, indent=2, default=str)
        logger.debug("Storage saved to file")
    except Exception as e:
        logger.error(f"Failed to save storage: {e}")


def clear_all():
    """Clear all in-memory storage (for testing)."""
    global parents, children, child_codes
    parents.clear()
    children.clear()
    child_codes.clear()



# Parent operations
def create_parent() -> dict[str, Any]:
    """Create a new parent."""
    parent_id = str(uuid.uuid4())
    parent = {
        "id": parent_id,
        "linked_children": [],
        "created_at": datetime.utcnow().isoformat(),
    }
    parents[parent_id] = parent
    save_storage()
    logger.info(f"Created parent: {parent_id}")
    return parent


def get_parent(parent_id: str) -> dict[str, Any] | None:
    """Get a parent by ID."""
    return parents.get(parent_id)


# Child operations
def create_child() -> dict[str, Any]:
    """Create a new child (unlinked)."""
    child_id = str(uuid.uuid4())
    child_code = generate_child_code()
    
    child = {
        "id": child_id,
        "child_code": child_code,
        "parent_id": None,
        "current_trip": None,
        "trip_history": [],
        "created_at": datetime.utcnow().isoformat(),
    }
    children[child_id] = child
    child_codes[child_code] = child_id
    save_storage()
    logger.info(f"Created child: {child_id} with code: {child_code}")
    return child


def get_child(child_id: str) -> dict[str, Any] | None:
    """Get a child by ID."""
    return children.get(child_id)


def get_child_by_code(code: str) -> dict[str, Any] | None:
    """Get a child by their code."""
    child_id = child_codes.get(code)
    if child_id:
        return children.get(child_id)
    return None


# Linking operations
def link_child_to_parent(parent_id: str, child_code: str) -> tuple[bool, str]:
    """Link a child to a parent using child code."""
    if parent_id not in parents:
        return False, "Parent not found"
    
    child = get_child_by_code(child_code)
    if not child:
        return False, "Child code not found"
    
    child_id = child["id"]
    
    # Check if child already linked
    if child["parent_id"] is not None:
        return False, "Child already linked to another parent"
    
    # Link child to parent
    child["parent_id"] = parent_id
    parents[parent_id]["linked_children"].append(child_id)
    
    save_storage()
    logger.info(f"Linked child {child_id} to parent {parent_id}")
    return True, "Child linked successfully"


# Trip operations
def start_trip(child_id: str) -> dict[str, Any] | None:
    """Start a new trip for a child."""
    if child_id not in children:
        return None
    
    child = children[child_id]
    
    trip = {
        "id": str(uuid.uuid4()),
        "events": [],
        "status": "active",
        "started_at": datetime.utcnow().isoformat(),
        "ended_at": None,
    }
    
    child["current_trip"] = trip
    save_storage()
    logger.info(f"Started trip {trip['id']} for child {child_id}")
    return trip


def add_event_to_trip(child_id: str, event_data: dict[str, Any]) -> dict[str, Any] | None:
    """Add event to current trip."""
    if child_id not in children:
        return None
    
    child = children[child_id]
    if not child["current_trip"]:
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
    save_storage()
    logger.info(f"Added event {event['id']} to trip {child['current_trip']['id']}")
    return event


def end_trip(child_id: str) -> bool:
    """End the current trip for a child."""
    if child_id not in children:
        return False
    
    child = children[child_id]
    if not child["current_trip"]:
        return False
    
    # Move current trip to history
    trip = child["current_trip"]
    trip["status"] = "ended"
    trip["ended_at"] = datetime.utcnow().isoformat()
    
    child["trip_history"].append(trip)
    child["current_trip"] = None
    
    save_storage()
    logger.info(f"Ended trip {trip['id']} for child {child_id}")
    return True


def get_parent_dashboard(parent_id: str) -> dict[str, Any] | None:
    """Get dashboard data for a parent with all linked children."""
    if parent_id not in parents:
        return None
    
    parent = parents[parent_id]
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
    """Get dashboard data for a child."""
    if child_id not in children:
        return None
    
    child = children[child_id]
    return {
        "child": child,
        "current_trip": child["current_trip"],
        "trip_history": child["trip_history"],
    }


def is_healthy() -> bool:
    """Check if storage is operational."""
    try:
        ensure_data_dir()
        return True
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        return False
