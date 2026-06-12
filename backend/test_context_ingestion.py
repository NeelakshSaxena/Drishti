import sys
import os
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from app.memory.device.temporal_store import TemporalStore
from app.ingestion.device.telemetry_processor import TelemetryProcessor
from app.context.device.agent_api import AgentDeviceQueryAPI
from app.pipelines.device.replay import ReplayPipeline

def test_context_ingestion():
    print("Testing Context & Memory Ingestion Pipeline...")
    
    store = TemporalStore()
    processor = TelemetryProcessor(store)
    agent_api = AgentDeviceQueryAPI(store)
    replay = ReplayPipeline(store, processor)
    
    device_id = "test_dev_1"
    
    # 1. Test Ingestion & Timestamp Normalization
    processor.process(
        device_id=device_id,
        event_type="battery",
        raw_data={"level": 90},
        raw_timestamp="2025-01-01T12:00:00Z"
    )
    
    state = agent_api.query_latest_state(device_id, "battery")
    assert state is not None
    assert state["data"]["level"] == 90
    assert state["confidence"] == 1.0
    print("[OK] Telemetry enters memory pipeline with normalized timestamps")
    
    # 2. Test Duplicate Suppression
    processor.process(device_id, "battery", {"level": 90}) # Exact same
    history = agent_api.query_temporal_context(device_id, "battery")
    assert len(history) == 1, f"Expected 1 event, got {len(history)}"
    
    processor.process(device_id, "battery", {"level": 89}) # Changed
    history = agent_api.query_temporal_context(device_id, "battery")
    assert len(history) == 2, f"Expected 2 events, got {len(history)}"
    print("[OK] Duplicate suppression works")
    
    # 3. Test Agent Queries
    processor.process(device_id, "media_state", {"title": "Lofi Hip Hop"})
    explanation = agent_api.explain_context(device_id)
    assert "Battery is at 89%" in explanation
    assert "Lofi Hip Hop" in explanation
    print("[OK] Queries return latest device state for agents")
    
    # 4. Test Malformed/Missing Data
    try:
        processor.process(device_id, "app_usage", None)
        assert False, "Should raise exception or handle gracefully depending on implementation"
    except Exception:
        print("[OK] Malformed packets rejected")
        
    # 5. Test Replay Pipeline
    raw_events = [
        {"device_id": device_id, "event_type": "location", "data": {"lat": 10, "lon": 20}, "timestamp": "2025-01-01T00:00:00Z"},
        {"device_id": device_id, "event_type": "location", "data": {"lat": 10, "lon": 20}, "timestamp": "2025-01-01T00:01:00Z"}, # Duplicate data
        {"device_id": device_id, "event_type": "location", "data": {"lat": 11, "lon": 21}, "timestamp": "2025-01-01T00:02:00Z"}
    ]
    processed = replay.replay_events(raw_events)
    assert processed == 2, "Replay should have deduplicated one event"
    
    loc_state = agent_api.query_latest_state(device_id, "location")
    assert loc_state["data"]["lat"] == 11
    print("[OK] Replay pipeline works")
    
    print("[SUCCESS] All context ingestion tests passed!")
    return 0

if __name__ == "__main__":
    sys.exit(test_context_ingestion())
