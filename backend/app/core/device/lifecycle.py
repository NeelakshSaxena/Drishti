import logging
from datetime import datetime
from app.services.device.telemetry import TelemetryIngestionService

logger = logging.getLogger(__name__)

class DeviceLifecycleManager:
    def __init__(self, telemetry_service: TelemetryIngestionService, timeout_seconds: int = 300):
        self.telemetry_service = telemetry_service
        self.timeout_seconds = timeout_seconds

    def check_lifecycles(self):
        """Check all device states for timeouts and transition to offline if needed."""
        states = self.telemetry_service.get_all_states()
        now = datetime.utcnow()
        for device_id, state in states.items():
            if state.status == "online" and state.last_heartbeat:
                if (now - state.last_heartbeat).total_seconds() > self.timeout_seconds:
                    logger.info(f"Device {device_id} timed out. Marking offline.")
                    self.telemetry_service.update_state(device_id, status="offline")
