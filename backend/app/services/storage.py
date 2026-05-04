"""
In-memory storage manager for children, trips, locations, and events.
Supports optional JSON persistence for recovery across restarts.
"""

import json
import os
import uuid
import logging
from datetime import datetime
from typing import Any

logger = logging.getLogger(__name__)

# Data file paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
STORAGE_FILE = os.path.join(DATA_DIR, "storage.json")

# In-memory data stores
children: dict[str, dict[str, Any]] = {}
trips: dict[str, dict[str, Any]] = {}
locations: dict[str, dict[str, Any]] = {}


def ensure_data_dir():
    """Create data directory if it doesn't exist."""
    os.makedirs(DATA_DIR, exist_ok=True)


def load_storage():
    """Load data from JSON file into memory."""
    global children, trips, locations
    
    if not os.path.exists(STORAGE_FILE):
        logger.info("No storage file found. Starting with empty storage.")
        return

    try:
        with open(STORAGE_FILE, "r") as f:
            data = json.load(f)
            children = data.get("children", {})
            trips = data.get("trips", {})
            locations = data.get("locations", {})
        logger.info(f"Loaded storage: {len(children)} children, {len(trips)} trips")
    except Exception as e:
        logger.error(f"Failed to load storage: {e}")


def save_storage():
    """Save in-memory data to JSON file."""
    ensure_data_dir()
    
    try:
        data = {
            "children": children,
            "trips": trips,
            "locations": locations,
        }
        with open(STORAGE_FILE, "w") as f:
            json.dump(data, f, indent=2, default=str)
        logger.debug("Storage saved to file")
    except Exception as e:
        logger.error(f"Failed to save storage: {e}")


def clear_all():
    """Clear all in-memory storage (for testing)."""
    global children, trips, locations
    children.clear()
    trips.clear()
    locations.clear()


# Child operations
def create_child(name: str) -> dict[str, Any]:
    """Create a new child."""
    child_id = str(uuid.uuid4())
    child = {
        "id": child_id,
        "name": name,
        "active_trip_id": None,
        "created_at": datetime.utcnow().isoformat(),
    }
    children[child_id] = child
    save_storage()
    logger.info(f"Created child: {child_id} ({name})")
    return child


def get_child(child_id: str) -> dict[str, Any] | None:
    """Get a child by ID."""
    return children.get(child_id)


def get_all_children() -> list[dict[str, Any]]:
    """Get all children."""
    return list(children.values())


def update_child_active_trip(child_id: str, trip_id: str | None) -> bool:
    """Update a child's active trip ID."""
    if child_id not in children:
        return False
    
    children[child_id]["active_trip_id"] = trip_id
    save_storage()
    logger.info(f"Updated child {child_id} active trip to {trip_id}")
    return True


# Trip operations
def create_trip(child_id: str, events: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    """Create a new trip."""
    if child_id not in children:
        raise ValueError(f"Child {child_id} not found")
    
    trip_id = str(uuid.uuid4())
    trip = {
        "id": trip_id,
        "child_id": child_id,
        "status": "active",
        "current_event_index": 0,
        "events": events or [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    trips[trip_id] = trip
    update_child_active_trip(child_id, trip_id)
    save_storage()
    logger.info(f"Created trip: {trip_id} for child {child_id}")
    return trip


def get_trip(trip_id: str) -> dict[str, Any] | None:
    """Get a trip by ID."""
    return trips.get(trip_id)


def end_trip(trip_id: str) -> bool:
    """End a trip."""
    if trip_id not in trips:
        return False
    
    trip = trips[trip_id]
    trip["status"] = "ended"
    trip["updated_at"] = datetime.utcnow().isoformat()
    
    child_id = trip["child_id"]
    update_child_active_trip(child_id, None)
    
    save_storage()
    logger.info(f"Ended trip: {trip_id}")
    return True


def add_event_to_trip(trip_id: str, event: dict[str, Any]) -> dict[str, Any]:
    """Add an event to a trip."""
    if trip_id not in trips:
        raise ValueError(f"Trip {trip_id} not found")
    
    trip = trips[trip_id]
    event_id = str(uuid.uuid4())
    event["id"] = event_id
    event["status"] = event.get("status", "upcoming")
    
    trip["events"].append(event)
    trip["updated_at"] = datetime.utcnow().isoformat()
    
    save_storage()
    logger.info(f"Added event {event_id} to trip {trip_id}")
    return event


def next_event(trip_id: str) -> dict[str, Any] | None:
    """Mark current event as completed and move to next event."""
    if trip_id not in trips:
        return None
    
    trip = trips[trip_id]
    current_idx = trip["current_event_index"]
    
    # Mark current as completed
    if 0 <= current_idx < len(trip["events"]):
        trip["events"][current_idx]["status"] = "completed"
    
    # Move to next
    next_idx = current_idx + 1
    if next_idx < len(trip["events"]):
        trip["current_event_index"] = next_idx
        trip["events"][next_idx]["status"] = "current"
    else:
        trip["status"] = "ended"
    
    trip["updated_at"] = datetime.utcnow().isoformat()
    save_storage()
    
    logger.info(f"Advanced trip {trip_id} to event index {next_idx}")
    return trip["events"][next_idx] if next_idx < len(trip["events"]) else None


# Location operations
def update_location(child_id: str, lat: float, lng: float) -> dict[str, Any]:
    """Update or create a location record for a child."""
    if child_id not in children:
        raise ValueError(f"Child {child_id} not found")
    
    location = {
        "child_id": child_id,
        "lat": lat,
        "lng": lng,
        "updated_at": datetime.utcnow().isoformat(),
    }
    locations[child_id] = location
    save_storage()
    logger.info(f"Updated location for child {child_id}: ({lat}, {lng})")
    return location


def get_location(child_id: str) -> dict[str, Any] | None:
    """Get the latest location for a child."""
    return locations.get(child_id)


# Health check
def is_healthy() -> bool:
    """Check if storage is operational."""
    try:
        # Try to ensure directory exists
        ensure_data_dir()
        return True
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        return False
