from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid

class DeviceCommand(BaseModel):
    command_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    device_id: str
    command_type: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    retries: int = 0
    max_retries: int = 3
    signature: Optional[str] = None
    status: str = "pending"
