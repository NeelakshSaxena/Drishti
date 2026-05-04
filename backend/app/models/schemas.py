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

    class Config:
        allow_population_by_field_name = True


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
    child_code: str  # Unique 6-8 char code for parent linking
    parent_id: str | None = None  # Linked parent ID
    current_trip: Trip | None = None
    trip_history: list[Trip] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Parent models
class Parent(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
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


class ParentDashboardResponse(BaseModel):
    parent: Parent
    linked_children: list[Child] = []


class HealthCheckResponse(BaseModel):
    status: str = "ok"
    backend: str = "running"
    services: dict[str, str] = {"api": "up"}
