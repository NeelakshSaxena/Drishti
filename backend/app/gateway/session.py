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
        self.telemetry_service = telemetry_service

    async def connect(self, device_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_id] = websocket
        
        # Log heartbeat/online state
        self.telemetry_service.process_heartbeat(HeartbeatPayload(device_id=device_id))
        logger.info(f"Device {device_id} connected via WebSocket")

    def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]
        self.telemetry_service.update_state(device_id, status="offline")
        logger.info(f"Device {device_id} disconnected")

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

    def process_telemetry(self, device_id: str, event_type: str, data: dict):
        self.telemetry_service.process_telemetry(TelemetryPayload(
            device_id=device_id,
            event_type=event_type,
            data=data
        ))
