import sys
import os

# Add backend dir to python path to resolve app modules
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta
from app.schemas.device import HeartbeatPayload, TelemetryPayload, DeviceModel
from app.services.device.telemetry import TelemetryIngestionService, DeviceStateCache
from app.core.device.lifecycle import DeviceLifecycleManager
from app.models.device import IDeviceRepository
from app.core.device.registry import DeviceRegistry
from app.services.device.command_routing import CommandQueue, CommandRoutingService
from app.schemas.device import CommandPayload

# Simple in-memory repo for testing
class InMemoryDeviceRepo(IDeviceRepository):
    def __init__(self):
        self.devices = {}
    
    def save_device(self, device):
        self.devices[device.id] = device
        return device
        
    def get_device(self, device_id):
        return self.devices.get(device_id)
        
    def list_devices(self, owner_id):
        return [d for d in self.devices.values() if d.owner_id == owner_id]
        
    def delete_device(self, device_id):
        if device_id in self.devices:
            del self.devices[device_id]
            return True
        return False

def test_device_lifecycle():
    print("Testing device lifecycle...")
    
    # Setup
    cache = DeviceStateCache()
    telemetry_service = TelemetryIngestionService(cache)
    lifecycle_manager = DeviceLifecycleManager(telemetry_service, timeout_seconds=10)
    
    repo = InMemoryDeviceRepo()
    registry = DeviceRegistry(repo)
    
    # Test registry
    device = registry.register_device(name="My Phone", owner_id="user_1")
    assert device.name == "My Phone", "Device should be registered"
    device_id = device.id
    print("[OK] Device registered")
    
    # Test heartbeat
    telemetry_service.process_heartbeat(HeartbeatPayload(device_id=device_id))
    state = telemetry_service.get_device_state(device_id)
    assert state.status == "online", "Device should be online after heartbeat"
    print("[OK] Heartbeat processed")
    
    # Test telemetry
    telemetry_service.process_telemetry(TelemetryPayload(
        device_id=device_id, 
        event_type="battery", 
        data={"level": 80}
    ))
    state = telemetry_service.get_device_state(device_id)
    assert state.active_memory_context["battery"]["level"] == 80, "Telemetry data should be in context"
    assert state.status == "online", "Device should remain online"
    print("[OK] Telemetry ingested")
    
    # Test timeout
    # Hack the last heartbeat time
    state.last_heartbeat = datetime.utcnow() - timedelta(seconds=15)
    cache.set(device_id, state)
    
    lifecycle_manager.check_lifecycles()
    state = telemetry_service.get_device_state(device_id)
    assert state.status == "offline", "Device should be marked offline after timeout"
    print("[OK] Device timeout handled")
    
    # Test command routing
    queue = CommandQueue()
    routing = CommandRoutingService(queue)
    cmd = CommandPayload(device_id=device_id, command="vibrate")
    routing.dispatch_command(cmd)
    
    pending = routing.fetch_pending_commands(device_id)
    assert len(pending) == 1, "Should fetch 1 pending command"
    assert pending[0].command == "vibrate", "Command should be vibrate"
    
    pending_empty = routing.fetch_pending_commands(device_id)
    assert len(pending_empty) == 0, "Queue should be empty after fetch"
    print("[OK] Command routing passed")
    
    print("[SUCCESS] Device lifecycle test passed!")
    return 0

if __name__ == "__main__":
    sys.exit(test_device_lifecycle())
