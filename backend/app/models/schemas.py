"""
Pydantic data models for family tracking system.

Models:
- Parent/Child relationships with linking
- Trip management (start, end, events)
- Event tracking (flight, train, bus, hostel, custom)
- Health check response
"""

from typing import Any
from datetime import datetime
from pydantic import BaseModel, Field


def schema_to_dict(schema: BaseModel) -> dict[str, Any]:
    """Convert Pydantic model to dict, excluding None values."""
    if hasattr(schema, "model_dump"):
        return schema.model_dump(exclude_none=True)
    return schema.dict(exclude_none=True)


# Event models
class TripEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    type: str = Field(..., description="flight, train, bus, hostel, custom")
    from_location: str = Field(..., alias="from_location")
    to_location: str = Field(..., alias="to_location")
    time: str | None = None
    description: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {"populate_by_name": True}


# Trip models
class Trip(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    events: list[TripEvent] = []
    status: str = "active"  # active, ended
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: datetime | None = None


# Child models
class Child(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    name: str | None = None  # Optional display name
    email: str | None = None
    child_code: str  # Unique 6-8 char code for parent linking
    parent_id: str | None = None  # Linked parent ID
    active_trip_id: str | None = None
    current_trip: Trip | None = None
    trip_history: list[Trip] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    lat: float | None = None
    lon: float | None = None


# Parent models
class Parent(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    name: str | None = None
    email: str | None = None
    linked_children: list[str] = []  # List of child IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Request/Response models
class LinkChildRequest(BaseModel):
    child_code: str = Field(..., min_length=1, description="6-8 char code from child")


class StartTripRequest(BaseModel):
    pass  # Child starts a trip with no initial events


class TripEventRequest(BaseModel):
    type: str = Field(..., description="flight, train, bus, hostel, custom")
    from_location: str = Field(..., description="Starting location")
    to_location: str = Field(..., description="Ending location")
    time: str | None = None
    description: str = ""


class EndTripRequest(BaseModel):
    pass


class ChildDashboardResponse(BaseModel):
    child: Child
    current_trip: Trip | None
    parent_name: str | None = None


class ParentDashboardResponse(BaseModel):
    parent: Parent
    linked_children: list[Child] = []


class HealthCheckResponse(BaseModel):
    status: str = "ok"
    backend: str = "running"
    services: dict = {"api": True}
    errors: list[str] = []


# ===== Management route schemas =====

class CreateChildRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)


class AddEventRequest(BaseModel):
    type: str = Field(..., description="flight, train, bus, car, hostel, hotel, custom")
    from_location: str | None = Field(None, alias="from")
    to_location: str | None = Field(None, alias="to")
    from_field: str | None = Field(None)
    to_field: str | None = Field(None)
    time: str | None = None
    ticket_url: str | None = None

    model_config = {"populate_by_name": True}


class StartTripChildRequest(BaseModel):
    events: list[AddEventRequest] = []


class LocationUpdate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lon: float = Field(..., ge=-180, le=180)


# ===== Process route schemas (legacy) =====

class VerifyFlightRequest(BaseModel):
    airline_iata: str
    flight_number: str
    flight_date: str | None = None


class UpdateSegmentStatusRequest(BaseModel):
    segment_index: int
    status: str


class LogLocationRequest(BaseModel):
    lat: float
    lon: float


# ===== Registration schemas =====

class ParentInitRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3)
    password: str | None = None


class ChildInitRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str | None = None
    age: int | None = Field(None, ge=4, le=25)
    password: str | None = None


class ParentLoginRequest(BaseModel):
    name: str | None = None
    email: str = Field(..., min_length=1, max_length=100)
    password: str | None = None


class ChildLoginRequest(BaseModel):
    name: str | None = None
    email: str = Field(..., min_length=1, max_length=100)
    password: str | None = None
