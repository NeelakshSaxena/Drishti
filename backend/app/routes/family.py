"""
Family tracking routes for parent-child linking and trip management.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    LinkChildRequest,
    StartTripRequest,
    TripEventRequest,
    EndTripRequest,
    ChildDashboardResponse,
    ParentDashboardResponse,
    HealthCheckResponse,
    ParentInitRequest,
    ChildInitRequest,
    ParentLoginRequest,
    ChildLoginRequest,
    LocationUpdate,
)
from app.services import storage

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Registration ──────────────────────────────────────────────────────────────

@router.post("/parent/init")
def init_parent(request: ParentInitRequest):
    """Register a new parent account."""
    try:
        existing = storage.find_parent_by_email(request.email)
        if existing:
            return {"success": False, "message": "Account already exists with this email. Please log in."}
        parent = storage.create_parent(name=request.name, email=request.email, password=request.password)
        return {
            "success": True,
            "parent_id": parent["id"],
            "name": parent["name"],
        }
    except Exception as e:
        logger.error(f"Error initializing parent: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize parent")


@router.post("/child/init")
def init_child(request: ChildInitRequest):
    """Register a new child account."""
    try:
        if request.email:
            existing = storage.find_child_by_email(request.email)
            if existing:
                return {"success": False, "message": "Account already exists with this email. Please log in."}
        child = storage.create_child(
            name=request.name, email=request.email,
            age=request.age, password=request.password
        )
        return {
            "success": True,
            "child_id": child["id"],
            "child_code": child["child_code"],
            "name": child["name"],
        }
    except Exception as e:
        logger.error(f"Error initializing child: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize child")


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/parent/login")
def login_parent(request: ParentLoginRequest):
    """Login a parent account."""
    try:
        parent = storage.find_parent_by_name_and_email(
            request.name, request.email, request.password
        )
        if parent:
            return {
                "success": True,
                "parent_id": parent["id"],
                "name": parent["name"],
            }
        return {"success": False, "message": "Invalid email or password. Please try again."}
    except Exception as e:
        logger.error(f"Error logging in parent: {e}")
        raise HTTPException(status_code=500, detail="Failed to login parent")


@router.post("/child/login")
def login_child(request: ChildLoginRequest):
    """Login a child account."""
    try:
        child = storage.find_child_by_email(request.email, request.password)
        if child:
            return {
                "success": True,
                "child_id": child["id"],
                "child_code": child["child_code"],
                "name": child["name"],
            }
        return {"success": False, "message": "Invalid email or password. Please try again."}
    except Exception as e:
        logger.error(f"Error logging in child: {e}")
        raise HTTPException(status_code=500, detail="Failed to login child")


# ── Linking ───────────────────────────────────────────────────────────────────

@router.post("/parent/link-child")
def link_child(request: LinkChildRequest, parent_id: str):
    """Link a child to a parent using child code."""
    try:
        success, message = storage.link_child_to_parent(parent_id, request.child_code)
        if not success:
            raise HTTPException(status_code=400, detail=message)
        child = storage.get_child_by_code(request.child_code)
        return {
            "success": True,
            "message": message,
            "child_name": child.get("name") if child else "Unknown",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking child: {e}")
        raise HTTPException(status_code=500, detail="Failed to link child")


# ── Location ──────────────────────────────────────────────────────────────────

@router.post("/child/location")
def update_location(child_id: str, location: LocationUpdate):
    try:
        storage.update_child_location(child_id, location.lat, location.lon)
        return {"success": True}
    except Exception as e:
        logger.error(f"Error updating child location: {e}")
        raise HTTPException(status_code=500, detail="Failed to update location")


# ── Share link ────────────────────────────────────────────────────────────────

@router.post("/child/share-link")
def create_share_link(child_id: str):
    """Generate a guest-view share link for the child."""
    try:
        child = storage.get_child(child_id)
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        token, expires_at = storage.create_share_token(child_id)
        return {
            "success": True,
            "token": token,
            "url": f"/guest/{token}",
            "expires_at": expires_at,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating share link: {e}")
        raise HTTPException(status_code=500, detail="Failed to create share link")


@router.post("/child/stop-sharing")
def stop_sharing(child_id: str):
    """Mark child as not actively sharing location."""
    try:
        child = storage.get_child(child_id)
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        storage.stop_sharing(child_id)
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping sharing: {e}")
        raise HTTPException(status_code=500, detail="Failed to stop sharing")


@router.get("/guest/{token}")
def get_guest_view(token: str):
    """Public endpoint – returns read-only location data for guest viewers."""
    try:
        child = storage.get_child_by_share_token(token)
        if not child:
            raise HTTPException(status_code=404, detail="Invalid or expired link")

        parent_name = None
        if child.get("parent_id"):
            parent = storage.get_parent(child["parent_id"])
            if parent:
                parent_name = parent.get("name")

        return {
            "child_name": child.get("name"),
            "parent_name": parent_name,
            "lat": child.get("lat"),
            "lon": child.get("lon"),
            "is_sharing": bool(child.get("is_sharing")),
            "location_updated_at": child.get("location_updated_at"),
            "current_trip": child.get("current_trip"),
            "trip_history": child.get("trip_history", []),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching guest view: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch guest view")


# ── Trip management ───────────────────────────────────────────────────────────

@router.post("/child/trip/start")
def start_trip(child_id: str):
    """Start a new trip for a child."""
    try:
        trip = storage.start_trip(child_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Child not found")
        return {"success": True, "trip": trip}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting trip: {e}")
        raise HTTPException(status_code=500, detail="Failed to start trip")


@router.post("/child/trip/event")
def add_event(child_id: str, event: TripEventRequest):
    """Add an event to current trip."""
    try:
        event_data = event.dict()
        result = storage.add_event_to_trip(child_id, event_data)
        if not result:
            raise HTTPException(status_code=400, detail="No active trip or child not found")
        return {"success": True, "event": result}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding event: {e}")
        raise HTTPException(status_code=500, detail="Failed to add event")


@router.post("/child/trip/end")
def end_trip(child_id: str):
    """End current trip for a child."""
    try:
        success = storage.end_trip(child_id)
        if not success:
            raise HTTPException(status_code=400, detail="No active trip or child not found")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending trip: {e}")
        raise HTTPException(status_code=500, detail="Failed to end trip")


# ── Dashboards ────────────────────────────────────────────────────────────────

@router.get("/parent/dashboard")
def get_parent_dashboard(parent_id: str):
    """Get parent dashboard with all linked children."""
    try:
        dashboard = storage.get_parent_dashboard(parent_id)
        if not dashboard:
            raise HTTPException(status_code=404, detail="Parent not found")
        return dashboard
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching parent dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard")


@router.get("/child/dashboard")
def get_child_dashboard(child_id: str):
    """Get child dashboard with current trip and history."""
    try:
        dashboard = storage.get_child_dashboard(child_id)
        if not dashboard:
            raise HTTPException(status_code=404, detail="Child not found")
        return dashboard
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching child dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard")


# ── Health check ──────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthCheckResponse)
def health_check():
    """Health check endpoint."""
    try:
        storage_ok = storage.is_healthy()
        return HealthCheckResponse(
            status="ok",
            backend="running",
            services={"api": "up", "storage": "up" if storage_ok else "down"},
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")
