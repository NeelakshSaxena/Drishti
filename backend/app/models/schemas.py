from typing import Any

from pydantic import BaseModel, Field


def schema_to_dict(schema: BaseModel) -> dict[str, Any]:
    if hasattr(schema, "model_dump"):
        return schema.model_dump(exclude_none=True)
    return schema.dict(exclude_none=True)


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
