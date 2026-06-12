from typing import List, Dict, Any
from app.ingestion.device.telemetry_processor import TelemetryProcessor
from app.memory.device.temporal_store import TemporalStore
import logging

logger = logging.getLogger(__name__)

class ReplayPipeline:
    def __init__(self, store: TemporalStore, processor: TelemetryProcessor):
        self.store = store
        self.processor = processor

    def replay_events(self, events: List[Dict[str, Any]]):
        """Replay historical raw telemetry events into the processor to rebuild memory."""
        logger.info(f"Replaying {len(events)} events...")
        # Clear current memory
        self.store.clear()
        self.processor.last_hashes.clear()
        
        # Ensure temporal ordering
        events_sorted = sorted(events, key=lambda x: x.get("timestamp", ""))
        
        processed_count = 0
        for raw_event in events_sorted:
            result = self.processor.process(
                device_id=raw_event["device_id"],
                event_type=raw_event["event_type"],
                raw_data=raw_event["data"],
                raw_timestamp=raw_event.get("timestamp")
            )
            if result:
                processed_count += 1
                
        logger.info(f"Replay complete. {processed_count} events persisted after deduplication.")
        return processed_count
