from pydantic import BaseModel, Field
from typing import Any, Dict
from datetime import datetime

class DeviceBaseEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    device_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class DeviceConnectedEvent(DeviceBaseEvent):
    pass

class DeviceDisconnectedEvent(DeviceBaseEvent):
    reason: str = "timeout"

class CommandDispatchedEvent(DeviceBaseEvent):
    command_id: str
    command_name: str

class TelemetryIngestedEvent(DeviceBaseEvent):
    event_type: str
    payload: Dict[str, Any]
