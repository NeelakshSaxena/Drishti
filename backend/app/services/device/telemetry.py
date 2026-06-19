import logging
from typing import Dict, Optional
from app.schemas.device import HeartbeatPayload, TelemetryPayload, DeviceState
from app.services import storage

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
        state = self.get_device_state(payload.device_id)
        if not state:
            state = DeviceState(device_id=payload.device_id)
        
        state.last_heartbeat = payload.timestamp
        state.status = "online"
        self.cache.set(payload.device_id, state)
        
        # Persist to database
        storage.update_device_state(payload.device_id, status="online", last_heartbeat=payload.timestamp)
        logger.debug(f"Heartbeat processed for {payload.device_id}")

    def process_telemetry(self, payload: TelemetryPayload):
        state = self.get_device_state(payload.device_id)
        if not state:
            state = DeviceState(device_id=payload.device_id, status="online")
        
        state.active_memory_context[payload.event_type] = payload.data
        state.last_heartbeat = payload.timestamp
        self.cache.set(payload.device_id, state)
        
        # Persist context and heartbeat to database
        storage.update_device_state(
            payload.device_id, 
            status="online",
            last_heartbeat=payload.timestamp,
            active_memory_context=state.active_memory_context
        )
        
        try:
            storage.add_device_telemetry(payload.device_id, payload.event_type, payload.data)
            logger.debug(f"Telemetry {payload.event_type} ingested & persisted for {payload.device_id}")
        except Exception as e:
            logger.error(f"Failed to persist telemetry for {payload.device_id}: {e}")

    def get_device_state(self, device_id: str) -> Optional[DeviceState]:
        state = self.cache.get(device_id)
        if state:
            return state
            
        # Fetch from database if not in cache
        device = storage.get_device(device_id)
        if device:
            state = DeviceState(
                device_id=device_id,
                status=device.get("status", "offline"),
                last_heartbeat=device.get("last_heartbeat"),
                active_memory_context=device.get("active_memory_context", {})
            )
            self.cache.set(device_id, state)
            return state
            
        return None
        
    def update_state(self, device_id: str, **kwargs):
        state = self.get_device_state(device_id)
        if state:
            for k, v in kwargs.items():
                setattr(state, k, v)
            self.cache.set(device_id, state)
            
            # Extract persistence fields
            db_kwargs = {}
            if "status" in kwargs:
                db_kwargs["status"] = kwargs["status"]
            if "last_heartbeat" in kwargs:
                db_kwargs["last_heartbeat"] = kwargs["last_heartbeat"]
            if "active_memory_context" in kwargs:
                db_kwargs["active_memory_context"] = kwargs["active_memory_context"]
                
            if db_kwargs:
                storage.update_device_state(device_id, **db_kwargs)

    def get_all_states(self) -> Dict[str, DeviceState]:
        # Always fetch from cache for memory operations, but ideally this should query DB
        # if this is used globally. For now, just return cache as it will be populated dynamically.
        return self.cache.get_all()
