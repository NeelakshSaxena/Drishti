from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List
import uuid

router = APIRouter()

# In-memory mock database
DEVICE_DB = {}
REVOKED_TOKENS = set()

class RegisterRequest(BaseModel):
    pairing_code: str
    name: str

class SyncRequest(BaseModel):
    capabilities: List[str]
    health: Dict[str, bool]

@router.post("/register")
async def register_device(req: RegisterRequest):
    if req.pairing_code != "VALID_CODE":
        raise HTTPException(status_code=401, detail="Invalid pairing code")
    
    device_id = str(uuid.uuid4())
    token = f"jwt_mock_{device_id}"
    
    DEVICE_DB[device_id] = {
        "name": req.name,
        "token": token,
        "status": "active",
        "capabilities": []
    }
    
    return {"token": token, "device_id": device_id}

@router.post("/sync")
async def sync_capabilities(req: SyncRequest):
    # In reality, extract token from Bearer header
    # and update device records.
    return {"status": "synced"}

@router.post("/revoke")
async def revoke_device(device_id: str):
    if device_id in DEVICE_DB:
        DEVICE_DB[device_id]["status"] = "revoked"
        REVOKED_TOKENS.add(DEVICE_DB[device_id]["token"])
        return {"status": "revoked"}
    raise HTTPException(status_code=404, detail="Device not found")
