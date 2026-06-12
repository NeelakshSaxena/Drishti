import logging
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException, Depends
from typing import Optional
from app.gateway.auth import authenticate_device
from app.gateway.session import SessionManager
from app.services.device.telemetry import TelemetryIngestionService, DeviceStateCache
from app.schemas.device import HeartbeatPayload

logger = logging.getLogger(__name__)
router = APIRouter()

# Instantiate global dependencies
global_cache = DeviceStateCache()
global_telemetry_service = TelemetryIngestionService(global_cache)
session_manager = SessionManager(global_telemetry_service)

@router.websocket("/device")
async def device_websocket(websocket: WebSocket, token: str = Query(...)):
    device_id = authenticate_device(token)
    if not device_id:
        await websocket.close(code=1008, reason="Invalid auth token")
        return

    await session_manager.connect(device_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                msg_type = payload.get("type")
                
                if msg_type == "heartbeat":
                    session_manager.telemetry_service.process_heartbeat(
                        HeartbeatPayload(device_id=device_id)
                    )
                elif msg_type == "telemetry":
                    event_type = payload.get("event_type", "unknown")
                    event_data = payload.get("data", {})
                    session_manager.process_telemetry(device_id, event_type, event_data)
                else:
                    logger.warning(f"Unknown message type {msg_type} from {device_id}")
                    
                # Echo back ACK
                await websocket.send_json({"type": "ack", "msg_type": msg_type})
                
            except json.JSONDecodeError:
                logger.error(f"Malformed JSON from device {device_id}")
                await websocket.send_json({"type": "error", "message": "Malformed JSON"})
                
    except WebSocketDisconnect:
        session_manager.disconnect(device_id)
        logger.info(f"Device {device_id} disconnected cleanly")
    except Exception as e:
        session_manager.disconnect(device_id)
        logger.error(f"Device {device_id} disconnected with error: {e}")

@router.post("/dispatch/{device_id}")
async def dispatch_command(device_id: str, command: str, parameters: dict):
    """Admin endpoint to test command dispatch"""
    success = await session_manager.send_command(device_id, command, parameters)
    if not success:
        raise HTTPException(status_code=404, detail="Device not connected")
    return {"status": "success", "command": command}
