import logging
from typing import List, Dict
from app.schemas.device import CommandPayload

logger = logging.getLogger(__name__)

class CommandQueue:
    def __init__(self):
        self._queues: Dict[str, List[CommandPayload]] = {}

    def enqueue(self, device_id: str, command: CommandPayload):
        if device_id not in self._queues:
            self._queues[device_id] = []
        self._queues[device_id].append(command)

    def dequeue_all(self, device_id: str) -> List[CommandPayload]:
        commands = self._queues.get(device_id, [])
        self._queues[device_id] = []
        return commands

class CommandRoutingService:
    def __init__(self, queue: CommandQueue):
        self.queue = queue

    def dispatch_command(self, payload: CommandPayload) -> str:
        logger.info(f"Dispatching command {payload.command} to device {payload.device_id}")
        self.queue.enqueue(payload.device_id, payload)
        return payload.command_id

    def fetch_pending_commands(self, device_id: str) -> List[CommandPayload]:
        return self.queue.dequeue_all(device_id)
