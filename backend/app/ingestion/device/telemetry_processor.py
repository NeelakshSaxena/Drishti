from datetime import datetime, timezone
import hashlib
import json
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class TelemetryProcessor:
    def __init__(self, temporal_store):
        self.temporal_store = temporal_store
        self.last_hashes: Dict[str, str] = {}

    def process(self, device_id: str, event_type: str, raw_data: Dict[str, Any], raw_timestamp: Optional[str] = None):
        if raw_data is None or not isinstance(raw_data, dict):
            raise ValueError("Malformed packet: raw_data must be a dictionary")

        # 1. Timestamp Normalization
        if raw_timestamp:
            try:
                # Handle isoformat
                ts = datetime.fromisoformat(raw_timestamp.replace("Z", "+00:00"))
                ts = ts.astimezone(timezone.utc)
            except ValueError:
                ts = datetime.now(timezone.utc)
        else:
            ts = datetime.now(timezone.utc)

        # 2. Deduplication
        content_hash = hashlib.sha256(json.dumps(raw_data, sort_keys=True).encode()).hexdigest()
        dedup_key = f"{device_id}:{event_type}"
        if self.last_hashes.get(dedup_key) == content_hash:
            logger.debug(f"Duplicate suppressed for {dedup_key}")
            return None # Suppress duplicate
        self.last_hashes[dedup_key] = content_hash

        # 3. Event Confidence Scoring & Context Tagging
        confidence = 1.0
        tags = [event_type]
        if event_type in ["battery", "connectivity", "location"]:
            confidence = 1.0
            tags.append("system")
        elif event_type in ["app_usage", "media_state"]:
            confidence = 0.9
            tags.append("user_activity")
        elif event_type == "notifications":
            confidence = 0.95
            tags.append("passive_interaction")
        else:
            confidence = 0.5
            tags.append("unknown")

        # 4. Source Attribution
        source = f"device_node_{device_id}"

        # Construct contextual memory event
        event = {
            "device_id": device_id,
            "event_type": event_type,
            "data": raw_data,
            "timestamp": ts,
            "confidence": confidence,
            "tags": tags,
            "source": source
        }
        
        # 5. Route to Memory Pipeline
        self.temporal_store.append(event)
        return event
