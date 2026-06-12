import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from fastapi import FastAPI
from app.gateway.ws import router as ws_router
from app.gateway.ws import session_manager, global_telemetry_service

app = FastAPI()
app.include_router(ws_router, prefix="/ws")

client = TestClient(app)

def test_invalid_auth():
    print("Testing invalid auth...")
    try:
        with client.websocket_connect("/ws/device?token=invalid") as websocket:
            pass
    except Exception as e:
        if hasattr(e, 'code'):
            assert e.code == 1008, f"Expected closure code 1008, got {e.code}"
        else:
            assert "403" in str(e) or "1008" in str(e) or "close" in str(e).lower(), f"Expected closure, got {e}"
    print("[OK] Invalid auth rejected")

def test_valid_auth_and_telemetry():
    print("Testing valid auth & telemetry...")
    with client.websocket_connect("/ws/device?token=dev-token-123") as websocket:
        # Check session manager
        assert "device_1" in session_manager.active_connections
        state = global_telemetry_service.get_device_state("device_1")
        assert state.status == "online"
        
        # Send telemetry
        websocket.send_json({
            "type": "telemetry",
            "event_type": "battery",
            "data": {"level": 95}
        })
        
        # Read ack
        ack = websocket.receive_json()
        assert ack["type"] == "ack"
        
        # Verify state
        state = global_telemetry_service.get_device_state("device_1")
        assert state.active_memory_context["battery"]["level"] == 95
        
    # Check disconnect cleaned up
    assert "device_1" not in session_manager.active_connections
    state = global_telemetry_service.get_device_state("device_1")
    assert state.status == "offline"
    print("[OK] Telemetry ingested and session cleaned on disconnect")

def test_reconnect():
    print("Testing reconnect & dispatch...")
    with client.websocket_connect("/ws/device?token=dev-token-456") as ws1:
        assert "device_2" in session_manager.active_connections
        ws1.send_json({"type": "heartbeat"})
        ws1.receive_json()
        
    assert "device_2" not in session_manager.active_connections
    
    with client.websocket_connect("/ws/device?token=dev-token-456") as ws2:
        assert "device_2" in session_manager.active_connections
        
        # Test command dispatch
        res = client.post("/ws/dispatch/device_2?command=vibrate", json={"duration": 500})
        assert res.status_code == 200
        
        cmd = ws2.receive_json()
        assert cmd["type"] == "command"
        assert cmd["command"] == "vibrate"
        assert cmd["parameters"]["duration"] == 500
        
    print("[OK] Reconnect works and commands dispatched")

def main():
    print("Starting Device Gateway Tests...")
    test_invalid_auth()
    test_valid_auth_and_telemetry()
    test_reconnect()
    print("[SUCCESS] All WS Gateway tests passed!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
