import logging
from typing import Dict, Any
from fastapi import WebSocket
from datetime import datetime
from app.services.device.telemetry import TelemetryIngestionService
from app.schemas.device import HeartbeatPayload, TelemetryPayload, DeviceState

logger = logging.getLogger(__name__)

class SessionManager:
    def __init__(self, telemetry_service: TelemetryIngestionService):
        self.active_connections: Dict[str, WebSocket] = {}
        self.frontend_connections: Dict[str, list[WebSocket]] = {}
        self.telemetry_service = telemetry_service

    async def connect(self, device_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_id] = websocket
        
        # Log heartbeat/online state
        await self.process_heartbeat(device_id)
        logger.info(f"Device {device_id} connected via WebSocket")

    async def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]
        self.telemetry_service.update_state(device_id, status="offline")
        from app.services.storage import get_device
        device = get_device(device_id)
        if device and device.get('child_id'):
            await self.broadcast_to_frontend(device['child_id'], {
                "type": "device_status",
                "device_id": device_id,
                "status": "offline"
            })
        logger.info(f"Device {device_id} disconnected")

    async def connect_frontend(self, child_id: str, websocket: WebSocket):
        await websocket.accept()
        if child_id not in self.frontend_connections:
            self.frontend_connections[child_id] = []
        self.frontend_connections[child_id].append(websocket)
        logger.info(f"Frontend connected for child {child_id}")

    def disconnect_frontend(self, child_id: str, websocket: WebSocket):
        if child_id in self.frontend_connections:
            if websocket in self.frontend_connections[child_id]:
                self.frontend_connections[child_id].remove(websocket)
            if not self.frontend_connections[child_id]:
                del self.frontend_connections[child_id]
        logger.info(f"Frontend disconnected for child {child_id}")
        
    async def broadcast_to_frontend(self, child_id: str, message: dict):
        if child_id in self.frontend_connections:
            to_remove = []
            for ws in self.frontend_connections[child_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    to_remove.append(ws)
            for ws in to_remove:
                self.disconnect_frontend(child_id, ws)

    async def send_command(self, device_id: str, command: str, parameters: dict):
        if device_id in self.active_connections:
            ws = self.active_connections[device_id]
            await ws.send_json({"type": "command", "command": command, "parameters": parameters})
            logger.info(f"Command {command} sent to {device_id}")
            return True
        logger.warning(f"Failed to send command {command} to {device_id}: offline")
        return False
        
    async def broadcast(self, message: dict):
        for ws in self.active_connections.values():
            await ws.send_json(message)

    async def process_heartbeat(self, device_id: str):
        from app.services.storage import get_device
        payload = HeartbeatPayload(device_id=device_id)
        self.telemetry_service.process_heartbeat(payload)
        
        device = get_device(device_id)
        if device and device.get('child_id'):
            await self.broadcast_to_frontend(device['child_id'], {
                "type": "heartbeat",
                "device_id": device_id,
                "timestamp": payload.timestamp
            })

    async def process_telemetry(self, device_id: str, event_type: str, data: dict):
        from app.services.storage import get_device
        payload = TelemetryPayload(
            device_id=device_id,
            event_type=event_type,
            data=data
        )
        self.telemetry_service.process_telemetry(payload)
        
        device = get_device(device_id)
        if device and device.get('child_id'):
            await self.broadcast_to_frontend(device['child_id'], {
                "type": "telemetry",
                "device_id": device_id,
                "event_type": event_type,
                "data": data,
                "timestamp": payload.timestamp
            })
