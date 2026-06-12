from typing import List, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class TemporalStore:
    def __init__(self):
        # In-memory store: device_id -> list of events
        self._events: Dict[str, List[Dict[str, Any]]] = {}
        # Latest state cache: device_id -> event_type -> latest_event
        self._latest_state: Dict[str, Dict[str, Dict[str, Any]]] = {}

    def append(self, event: Dict[str, Any]):
        device_id = event["device_id"]
        event_type = event["event_type"]
        
        if device_id not in self._events:
            self._events[device_id] = []
        if device_id not in self._latest_state:
            self._latest_state[device_id] = {}
            
        self._events[device_id].append(event)
        self._latest_state[device_id][event_type] = event
        logger.debug(f"Event {event_type} appended to temporal store for {device_id}")

    def get_latest_state(self, device_id: str) -> Dict[str, Dict[str, Any]]:
        return self._latest_state.get(device_id, {})
        
    def get_history(self, device_id: str, event_type: str = None) -> List[Dict[str, Any]]:
        events = self._events.get(device_id, [])
        if event_type:
            events = [e for e in events if e["event_type"] == event_type]
        return events
        
    def clear(self):
        self._events.clear()
        self._latest_state.clear()
