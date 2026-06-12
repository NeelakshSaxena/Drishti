import logging
from typing import Dict, Optional
from app.schemas.device import HeartbeatPayload, TelemetryPayload, DeviceState

logger = logging.getLogger(__name__)

class DeviceStateCache:
    def __init__(self):
        self._states: Dict[str, DeviceState] = {}

    def get(self, device_id: str) -> Optional[DeviceState]:
        return self._states.get(device_id)

    def set(self, device_id: str, state: DeviceState):
        self._states[device_id] = state
        
    def get_all(self) -> Dict[str, DeviceState]:
        return self._states

class TelemetryIngestionService:
    def __init__(self, cache: DeviceStateCache):
        self.cache = cache

    def process_heartbeat(self, payload: HeartbeatPayload):
        state = self.cache.get(payload.device_id)
        if not state:
            state = DeviceState(device_id=payload.device_id)
        
        state.last_heartbeat = payload.timestamp
        state.status = "online"
        self.cache.set(payload.device_id, state)
        logger.debug(f"Heartbeat processed for {payload.device_id}")

    def process_telemetry(self, payload: TelemetryPayload):
        state = self.cache.get(payload.device_id)
        if not state:
            state = DeviceState(device_id=payload.device_id, status="online")
        
        state.active_memory_context[payload.event_type] = payload.data
        state.last_heartbeat = payload.timestamp
        self.cache.set(payload.device_id, state)
        logger.debug(f"Telemetry {payload.event_type} ingested for {payload.device_id}")

    def get_device_state(self, device_id: str) -> Optional[DeviceState]:
        return self.cache.get(device_id)
        
    def update_state(self, device_id: str, **kwargs):
        state = self.cache.get(device_id)
        if state:
            for k, v in kwargs.items():
                setattr(state, k, v)
            self.cache.set(device_id, state)

    def get_all_states(self) -> Dict[str, DeviceState]:
        return self.cache.get_all()
