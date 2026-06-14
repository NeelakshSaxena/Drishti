import logging
from fastapi import APIRouter
from pydantic import BaseModel
import uuid

from app.gateway.auth import VALID_TOKENS

logger = logging.getLogger(__name__)
router = APIRouter()

class DeviceRegisterRequest(BaseModel):
    pairing_code: str
    name: str

@router.post("/register")
def register_device(request: DeviceRegisterRequest):
    # In a real app, we would validate the pairing code.
    # For now, just generate a token and assign a device ID.
    device_id = f"device_{uuid.uuid4().hex[:8]}"
    token = f"dev-token-{uuid.uuid4().hex[:8]}"
    
    # Store in our dummy VALID_TOKENS dictionary so WebSocket auth works
    VALID_TOKENS[token] = device_id
    
    logger.info(f"Registered new device: {request.name} with ID {device_id} and token {token}")
    
    return {
        "token": token,
        "device_id": device_id
    }

@router.post("/sync")
def sync_capabilities(payload: dict):
    # Dummy endpoint for sync capabilities
    return {"status": "success"}
