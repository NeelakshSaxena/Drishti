from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.schemas import (
    LogLocationRequest,
    StartTripRequest,
    UpdateSegmentStatusRequest,
    VerifyFlightRequest,
    schema_to_dict,
)
from app.services import processing

router = APIRouter()


@router.post("/verify-flight")
def verify_flight(payload: VerifyFlightRequest):
    response, status_code = processing.verify_flight_data(schema_to_dict(payload))
    return JSONResponse(content=response, status_code=status_code)


@router.post("/start-trip")
def start_trip(payload: StartTripRequest):
    return processing.start_trip(schema_to_dict(payload))


@router.post("/update-segment-status")
def update_segment_status(payload: UpdateSegmentStatusRequest):
    response, status_code = processing.update_segment_status(schema_to_dict(payload))
    return JSONResponse(content=response, status_code=status_code)


@router.post("/log-location")
def log_location(payload: LogLocationRequest):
    return processing.log_location(schema_to_dict(payload))


@router.post("/end-trip")
def end_trip():
    return processing.end_trip()


@router.post("/reset-trip")
def reset_trip():
    return processing.reset_trip()


@router.get("/status")
def get_status():
    return processing.get_status()


@router.get("/trip-info")
def get_trip_info():
    return processing.get_trip_info()


@router.get("/trip-log")
def get_trip_log():
    return processing.get_trip_log()
