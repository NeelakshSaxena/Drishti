"""
Pydantic data models for request/response validation.

This module defines all data structures used in the API:
- Legacy schemas for backward compatibility with old endpoints
- New schemas for parent/child management
- Health check response schema
- Request schemas with validation

All models include field validation and documentation.
"""

from typing import Any
from datetime import datetime

from pydantic import BaseModel, Field


def schema_to_dict(schema: BaseModel) -> dict[str, Any]:
    """
    Convert Pydantic model to dictionary, excluding None values.
    
    Handles both Pydantic v1 and v2 API differences.
    
    Args:
        schema: Pydantic model instance
        
    Returns:
        Dictionary representation of the model
    """
    if hasattr(schema, "model_dump"):
        return schema.model_dump(exclude_none=True)
    return schema.dict(exclude_none=True)


# Legacy schemas (process routes)
class VerifyFlightRequest(BaseModel):
    airline_iata: str = Field(..., min_length=1)
    flight_number: str = Field(..., min_length=1)
    flight_date: str | None = None


class StartTripRequest(BaseModel):
    trip_id: str | None = None
    user_name: str | None = None
    trip_mode: str | None = None
    trip_start_time: str | None = None
    flight_number: str | None = None
    flight_info: dict[str, Any] | None = None
    segments: list[dict[str, Any]] | None = None


class UpdateSegmentStatusRequest(BaseModel):
    segment_index: int
    status: str = Field(..., min_length=1)


class LogLocationRequest(BaseModel):
    lat: float
    lon: float


# New schemas for parent/child management
class EventBase(BaseModel):
    type: str = Field(..., description="flight, train, hostel, etc")
    from_location: str | None = Field(None, alias="from", serialization_alias="from")
    to_location: str | None = Field(None, alias="to", serialization_alias="to")
    time: str | None = None
    ticket_url: str = "N/A"
    status: str = "upcoming"

    class Config:
        allow_population_by_field_name = True
        populate_by_name = True


class Event(EventBase):
    id: str | None = None


class TripBase(BaseModel):
    child_id: str = Field(..., description="Child ID for this trip")
    status: str = "active"
    current_event_index: int = 0


class Trip(TripBase):
    id: str
    events: list[Event] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ChildBase(BaseModel):
    name: str = Field(..., min_length=1)


class Child(ChildBase):
    id: str
    active_trip_id: str | None = None
    created_at: datetime | None = None


class LocationUpdate(BaseModel):
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")


class CreateChildRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Child's name")


class StartTripChildRequest(BaseModel):
    child_id: str | None = None
    events: list[EventBase] | None = None


class AddEventRequest(BaseModel):
    type: str = Field(..., description="Event type: flight, train, hostel, etc")
    from_location: str = Field(..., alias="from")
    to_location: str = Field(..., alias="to")
    time: str | None = None
    ticket_url: str = "N/A"

    class Config:
        allow_population_by_field_name = True


class HealthCheckResponse(BaseModel):
    status: str
    backend: str
    services: dict[str, bool]
    errors: list[str] = []
