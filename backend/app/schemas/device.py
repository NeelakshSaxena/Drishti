from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class CapabilitySchema(BaseModel):
    id: str
    name: str
    version: str
    properties: Dict[str, Any] = Field(default_factory=dict)

class DeviceState(BaseModel):
    device_id: str
    status: str = "offline"  # online, offline
    last_heartbeat: Optional[datetime] = None
    battery_level: Optional[int] = None
    capabilities_enabled: List[str] = Field(default_factory=list)
    active_memory_context: Dict[str, Any] = Field(default_factory=dict)

class DeviceModel(BaseModel):
    id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    name: str
    owner_id: str
    capabilities: List[CapabilitySchema] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
class HeartbeatPayload(BaseModel):
    device_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active"

class TelemetryPayload(BaseModel):
    device_id: str
    event_type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any]

class CommandPayload(BaseModel):
    command_id: str = Field(default_factory=lambda: str(__import__("uuid").uuid4()))
    device_id: str
    command: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    expires_at: Optional[datetime] = None
