from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import hmac
import hashlib
import json
import time

router = APIRouter()

# Mock DB for device secrets and used nonces (Replay Protection)
DEVICE_SECRETS = {"device_123": "DEFAULT_SECRET"}
USED_NONCES = set()
MAX_TIMESTAMP_DRIFT_MS = 5000  # 5 seconds strict window

class SecurePayload(BaseModel):
    payload: dict
    signature: str

def verify_signature(payload_dict: dict, signature: str, secret: str) -> bool:
    payload_str = json.dumps(payload_dict, separators=(',', ':'))
    expected_mac = hmac.new(secret.encode(), payload_str.encode(), hashlib.sha256).digest()
    import base64
    expected_signature = base64.b64encode(expected_mac).decode()
    return hmac.compare_digest(expected_signature, signature)

@router.post("/verify_packet")
async def verify_packet(data: SecurePayload, device_id: str = Header(...)):
    if device_id not in DEVICE_SECRETS:
        raise HTTPException(status_code=401, detail="Unknown device")
        
    secret = DEVICE_SECRETS[device_id]
    payload = data.payload
    
    # 1. Replay Protection: Check Nonce
    nonce = payload.get("nonce")
    if nonce in USED_NONCES:
        raise HTTPException(status_code=403, detail="Replay attack detected: Nonce reused")
        
    # 2. Replay Protection: Check Timestamp Drift
    packet_time = payload.get("timestamp", 0)
    current_time = int(time.time() * 1000)
    if abs(current_time - packet_time) > MAX_TIMESTAMP_DRIFT_MS:
        raise HTTPException(status_code=403, detail="Replay attack detected: Timestamp expired")
        
    # 3. Signature Verification
    if not verify_signature(payload, data.signature, secret):
        raise HTTPException(status_code=403, detail="Invalid signature")
        
    USED_NONCES.add(nonce)
    return {"status": "verified"}
