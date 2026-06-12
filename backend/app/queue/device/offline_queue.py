from typing import Dict, List, Optional
from datetime import datetime, timezone
import json
import os
from app.commands.device.schemas import DeviceCommand

class OfflineCommandQueue:
    def __init__(self, storage_file: str = "offline_queue.json"):
        self.storage_file = storage_file
        self._queues: Dict[str, List[DeviceCommand]] = {}
        self.load()

    def load(self):
        if os.path.exists(self.storage_file):
            try:
                with open(self.storage_file, 'r') as f:
                    data = json.load(f)
                    for dev_id, cmds in data.items():
                        self._queues[dev_id] = [DeviceCommand(**c) for c in cmds]
            except Exception:
                self._queues = {}

    def save(self):
        data = {
            dev_id: [c.model_dump(mode='json') for c in cmds] 
            for dev_id, cmds in self._queues.items()
        }
        with open(self.storage_file, 'w') as f:
            json.dump(data, f)

    def enqueue(self, command: DeviceCommand):
        if command.device_id not in self._queues:
            self._queues[command.device_id] = []
        
        existing = [c.command_id for c in self._queues[command.device_id]]
        if command.command_id not in existing:
            self._queues[command.device_id].append(command)
            self.save()

    def fetch_pending(self, device_id: str) -> List[DeviceCommand]:
        if device_id not in self._queues:
            return []
            
        now = datetime.now(timezone.utc)
        valid_commands = []
        changed = False
        
        for cmd in self._queues[device_id]:
            if cmd.expires_at and now > cmd.expires_at:
                changed = True
                continue
            valid_commands.append(cmd)
            
        if changed:
            self._queues[device_id] = valid_commands
            self.save()
            
        return valid_commands

    def remove(self, device_id: str, command_id: str):
        if device_id in self._queues:
            initial_len = len(self._queues[device_id])
            self._queues[device_id] = [c for c in self._queues[device_id] if c.command_id != command_id]
            if len(self._queues[device_id]) < initial_len:
                self.save()
