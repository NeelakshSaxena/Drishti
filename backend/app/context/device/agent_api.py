from typing import Dict, Any, List
from app.memory.device.temporal_store import TemporalStore

class AgentDeviceQueryAPI:
    def __init__(self, temporal_store: TemporalStore):
        self.store = temporal_store

    def query_latest_state(self, device_id: str, event_type: str = None) -> Any:
        state = self.store.get_latest_state(device_id)
        if event_type:
            return state.get(event_type)
        return state

    def query_temporal_context(self, device_id: str, event_type: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        history = self.store.get_history(device_id, event_type)
        # Return most recent first
        return sorted(history, key=lambda x: x["timestamp"], reverse=True)[:limit]
        
    def explain_context(self, device_id: str) -> str:
        state = self.query_latest_state(device_id)
        if not state:
            return "No context available for this device."
        
        explanation = []
        if "battery" in state:
            explanation.append(f"Battery is at {state['battery']['data'].get('level', 'unknown')}%.")
        if "media_state" in state:
            explanation.append(f"Currently playing: {state['media_state']['data'].get('title', 'unknown')}.")
        if "location" in state:
            explanation.append(f"Last known location updated at {state['location']['timestamp']}.")
            
        return " ".join(explanation)
