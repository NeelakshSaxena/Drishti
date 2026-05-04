"""
Parent and child management routes.

This module provides REST API endpoints for:
- Parent operations (create children, list children, get child details)
- Trip management (start, end)
- Event management (add events, advance to next event)
- Location tracking (update child location)
- Health checks

All endpoints include comprehensive error handling and logging.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    CreateChildRequest,
    Child,
    Trip,
    StartTripChildRequest,
    AddEventRequest,
    LocationUpdate,
    HealthCheckResponse,
)
from app.services import storage
from app.models.schemas import schema_to_dict

logger = logging.getLogger(__name__)
router = APIRouter()


# Parent Routes
@router.post("/parent/create-child", response_model=Child, tags=["parent"])
def create_child(request: CreateChildRequest):
    try:
        child_data = storage.create_child()
        # Patch name into the returned dict so the response model is satisfied
        child_data["name"] = request.name
        logger.info(f"Created child: {child_data['id']} - {request.name}")
        return child_data
    except ValueError as e:
        logger.warning(f"Validation error creating child: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error creating child: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create child. Please try again.",
        )


@router.get("/parent/children", response_model=list[Child], tags=["parent"])
def get_children():
    """
    Get all children.
    
    Returns:
        List of all Child objects
        
    Raises:
        HTTPException: 500 for server errors
    """
    try:
        children = storage.get_all_children()
        logger.debug(f"Retrieved {len(children)} children")
        return children
    except Exception as e:
        logger.error(f"Error fetching children: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve children",
        )


@router.get("/parent/child/{child_id}", response_model=Child, tags=["parent"])
def get_child(child_id: str):
    """
    Get a specific child by ID.
    
    Args:
        child_id: UUID of the child
        
    Returns:
        Child object
        
    Raises:
        HTTPException: 404 if child not found, 500 for server errors
    """
    try:
        child = storage.get_child(child_id)
        if not child:
            logger.warning(f"Child not found: {child_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Child '{child_id}' not found",
            )
        return child
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching child {child_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve child",
        )


# Child Routes
@router.post("/child/{child_id}/trip/start", tags=["child"])
def start_trip(child_id: str, request: StartTripChildRequest | None = None):
    """
    Start a new trip for a child.
    
    Args:
        child_id: UUID of the child
        request: Optional trip details with initial events
        
    Returns:
        Dict with status and created trip
        
    Raises:
        HTTPException: 404 if child not found, 400 if already on trip, 500 for server errors
    """
    try:
        child = storage.get_child(child_id)
        if not child:
            logger.warning(f"Attempted to start trip for non-existent child: {child_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Child '{child_id}' not found",
            )
        
        if child.get("active_trip_id"):
            logger.warning(f"Child {child_id} already has active trip: {child['active_trip_id']}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Child is already on a trip",
            )
        
        # Create trip with optional initial events
        events = []
        if request and request.events:
            for event in request.events:
                event_dict = schema_to_dict(event)
                # Standardize field names
                if "from_location" in event_dict:
                    event_dict["from"] = event_dict.pop("from_location")
                if "to_location" in event_dict:
                    event_dict["to"] = event_dict.pop("to_location")
                events.append(event_dict)
        
        trip = storage.create_trip(child_id, events)
        
        # Set first event as current if events exist
        if trip["events"]:
            trip["events"][0]["status"] = "current"
            storage.save_storage()
        
        logger.info(f"Started trip {trip['id']} for child {child_id}")
        return {"status": "success", "trip": trip}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting trip for child {child_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start trip. Please try again.",
        )


@router.post("/child/{child_id}/trip/end", tags=["child"])
def end_trip(child_id: str):
    """
    End the active trip for a child.
    
    Args:
        child_id: UUID of the child
        
    Returns:
        Dict with status and ended trip
        
    Raises:
        HTTPException: 404 if child or trip not found, 400 if no active trip, 500 for server errors
    """
    try:
        child = storage.get_child(child_id)
        if not child:
            logger.warning(f"Attempted to end trip for non-existent child: {child_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Child '{child_id}' not found",
            )
        
        trip_id = child.get("active_trip_id")
        if not trip_id:
            logger.warning(f"Attempted to end trip for child with no active trip: {child_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Child has no active trip",
            )
        
        result = storage.end_trip(trip_id)
        if not result:
            logger.error(f"Trip not found when ending: {trip_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip '{trip_id}' not found",
            )
        
        trip = storage.get_trip(trip_id)
        logger.info(f"Ended trip {trip_id} for child {child_id}")
        return {"status": "success", "trip": trip}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending trip for child {child_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to end trip. Please try again.",
        )
        logger.error(f"Error ending trip for child {child_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/trip/{trip_id}/event/add", tags=["child"])
def add_event(trip_id: str, request: AddEventRequest):
    """
    Add an event to a trip.
    
    Args:
        trip_id: UUID of the trip
        request: Event details (type, from, to, optional time and ticket_url)
        
    Returns:
        Dict with status and created event
        
    Raises:
        HTTPException: 404 if trip not found, 400 for validation errors, 500 for server errors
    """
    try:
        trip = storage.get_trip(trip_id)
        if not trip:
            logger.warning(f"Attempted to add event to non-existent trip: {trip_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip '{trip_id}' not found",
            )
        
        event = schema_to_dict(request)
        # Rename fields to match expected format
        if "from_location" in event:
            event["from"] = event.pop("from_location")
        if "to_location" in event:
            event["to"] = event.pop("to_location")
        
        added_event = storage.add_event_to_trip(trip_id, event)
        logger.info(f"Added event to trip {trip_id}: {added_event.get('type')} ({added_event.get('from')} → {added_event.get('to')})")
        return {"status": "success", "event": added_event}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding event to trip {trip_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add event. Please try again.",
        )


@router.post("/trip/{trip_id}/event/next", tags=["child"])
def advance_event(trip_id: str):
    """
    Advance to the next event in a trip.
    
    Args:
        trip_id: UUID of the trip
        
    Returns:
        Dict with current event index, event details, and trip status
        
    Raises:
        HTTPException: 404 if trip not found, 500 for server errors
    """
    try:
        trip = storage.get_trip(trip_id)
        if not trip:
            logger.warning(f"Attempted to advance event in non-existent trip: {trip_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Trip '{trip_id}' not found",
            )
        
        next_evt = storage.next_event(trip_id)
        updated_trip = storage.get_trip(trip_id)
        
        logger.info(f"Advanced event in trip {trip_id}, now at index {updated_trip['current_event_index']}")
        return {
            "status": "success",
            "current_event_index": updated_trip["current_event_index"],
            "current_event": next_evt,
            "trip_status": updated_trip["status"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error advancing event in trip {trip_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to advance event. Please try again.",
        )


@router.post("/child/{child_id}/location/update", tags=["child"])
def update_location(child_id: str, request: LocationUpdate):
    """
    Update a child's location.
    
    Args:
        child_id: UUID of the child
        request: LocationUpdate with latitude and longitude
        
    Returns:
        Dict with status and updated location
        
    Raises:
        HTTPException: 404 if child not found, 400 for invalid coordinates, 500 for server errors
    """
    try:
        child = storage.get_child(child_id)
        if not child:
            logger.warning(f"Attempted to update location for non-existent child: {child_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Child '{child_id}' not found",
            )
        
        # Validate coordinates
        if not (-90 <= request.lat <= 90) or not (-180 <= request.lng <= 180):
            logger.warning(f"Invalid coordinates for child {child_id}: lat={request.lat}, lng={request.lng}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid coordinates. Latitude must be -90 to 90, Longitude must be -180 to 180",
            )
        
        location = storage.update_location(child_id, request.lat, request.lng)
        logger.debug(f"Updated location for child {child_id}: {request.lat}, {request.lng}")
        return {"status": "success", "location": location}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating location for child {child_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update location. Please try again.",
        )


# Health Check Endpoint
@router.get("/health", response_model=HealthCheckResponse, tags=["health"])
def health_check():
    """
    Check backend health status.
    
    Returns:
        HealthCheckResponse with system status, backend state, and service availability
        
    Note:
        This endpoint has no error rates and always returns 200 with status info.
        Clients should check the 'status' field to determine if the system is healthy.
    """
    errors = []
    
    try:
        # Check storage availability
        storage_healthy = storage.is_healthy()
        if not storage_healthy:
            errors.append("Memory store health check failed")
        
        status_value = "ok" if storage_healthy else "degraded"
        
        logger.debug(f"Health check: status={status_value}, errors={len(errors)}")
        
        return {
            "status": status_value,
            "backend": "running",
            "services": {
                "api": True,
                "memory_store": storage_healthy,
            },
            "errors": errors,
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "error",
            "backend": "running",
            "services": {
                "api": True,
                "memory_store": False,
            },
            "errors": [str(e)],
        }
