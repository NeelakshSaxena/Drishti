import hmac
import hashlib
import json
from app.commands.device.schemas import DeviceCommand

class CommandSigner:
    def __init__(self, secret_key: str = "default_secret_key"):
        self.secret_key = secret_key.encode('utf-8')

    def sign_command(self, command: DeviceCommand) -> str:
        payload = {
            "command_id": command.command_id,
            "device_id": command.device_id,
            "command_type": command.command_type,
            "parameters": command.parameters,
            "created_at": command.created_at.isoformat()
        }
        msg = json.dumps(payload, sort_keys=True).encode('utf-8')
        signature = hmac.new(self.secret_key, msg, hashlib.sha256).hexdigest()
        command.signature = signature
        return signature

    def verify_command(self, command: DeviceCommand) -> bool:
        if not command.signature:
            return False
            
        payload = {
            "command_id": command.command_id,
            "device_id": command.device_id,
            "command_type": command.command_type,
            "parameters": command.parameters,
            "created_at": command.created_at.isoformat()
        }
        msg = json.dumps(payload, sort_keys=True).encode('utf-8')
        expected = hmac.new(self.secret_key, msg, hashlib.sha256).hexdigest()
        
        return hmac.compare_digest(expected, command.signature)
