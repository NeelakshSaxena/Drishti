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
)
from app.services import storage

logger = logging.getLogger(__name__)
router = APIRouter()


# Child initialization
@router.post("/child/init")
def init_child():
    """Initialize a new child (generates unique code)."""
    try:
        child = storage.create_child()
        return {
            "success": True,
            "child_id": child["id"],
            "child_code": child["child_code"],
        }
    except Exception as e:
        logger.error(f"Error initializing child: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize child")


# Parent initialization
@router.post("/parent/init")
def init_parent():
    """Initialize a new parent."""
    try:
        parent = storage.create_parent()
        return {
            "success": True,
            "parent_id": parent["id"],
        }
    except Exception as e:
        logger.error(f"Error initializing parent: {e}")
        raise HTTPException(status_code=500, detail="Failed to initialize parent")


# Linking
@router.post("/parent/link-child")
def link_child(request: LinkChildRequest, parent_id: str):
    """Link a child to a parent using child code."""
    try:
        success, message = storage.link_child_to_parent(parent_id, request.child_code)
        if not success:
            raise HTTPException(status_code=400, detail=message)
        return {
            "success": True,
            "message": message,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking child: {e}")
        raise HTTPException(status_code=500, detail="Failed to link child")


# Trip management - Child
@router.post("/child/trip/start")
def start_trip(child_id: str):
    """Start a new trip for a child."""
    try:
        trip = storage.start_trip(child_id)
        if not trip:
            raise HTTPException(status_code=404, detail="Child not found")
        return {
            "success": True,
            "trip": trip,
        }
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
        return {
            "success": True,
            "event": result,
        }
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


# Dashboard - Get data
@router.get("/parent/dashboard")
def get_parent_dashboard(parent_id: str) -> ParentDashboardResponse:
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
def get_child_dashboard(child_id: str) -> ChildDashboardResponse:
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


# Health check
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
