import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import uuid

from app.services import storage
from app.gateway.auth import authenticate_device

logger = logging.getLogger(__name__)
router = APIRouter()

class DeviceRegisterRequest(BaseModel):
    name: str
    pairing_code: str = ""  # Making it optional if possible or keeping it for compatibility

class DeviceLinkRequest(BaseModel):
    token: str
    child_code: str

@router.post("/register")
def register_device(request: DeviceRegisterRequest):
    try:
        device_id, token = storage.register_device(request.name)
        
        # Auto-link if pairing_code provided
        if request.pairing_code:
            success, msg = storage.link_device_to_child(device_id, request.pairing_code)
            if not success:
                logger.warning(f"Failed to auto-link device {device_id}: {msg}")

        logger.info(f"Registered new device: {request.name} with ID {device_id}")
        return {
            "token": token,
            "device_id": device_id
        }
    except Exception as e:
        logger.error(f"Error registering device: {e}")
        raise HTTPException(status_code=500, detail="Failed to register device")

@router.post("/link")
def link_device(request: DeviceLinkRequest):
    try:
        device_id = authenticate_device(request.token)
        if not device_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        success, message = storage.link_device_to_child(device_id, request.child_code)
        if not success:
            raise HTTPException(status_code=400, detail=message)
            
        return {"success": True, "message": message}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error linking device: {e}")
        raise HTTPException(status_code=500, detail="Failed to link device")

@router.post("/sync")
def sync_capabilities(payload: dict):
    # Dummy endpoint for sync capabilities
    return {"status": "success"}
