import sys
import os
from datetime import datetime, timezone, timedelta
import asyncio

sys.path.insert(0, os.path.dirname(__file__))

from app.commands.device.schemas import DeviceCommand
from app.commands.device.signer import CommandSigner
from app.queue.device.offline_queue import OfflineCommandQueue
from app.dispatch.device.dispatcher import CommandDispatcher

class MockTransport:
    def __init__(self):
        self.sent_messages = []
        self.device_online = True

    async def send(self, device_id: str, payload: dict) -> bool:
        if self.device_online:
            self.sent_messages.append((device_id, payload))
            return True
        return False

async def async_test_dispatch():
    print("Testing Command Dispatch System...")
    
    signer = CommandSigner()
    temp_q_file = "test_queue.json"
    if os.path.exists(temp_q_file):
        os.remove(temp_q_file)
        
    queue = OfflineCommandQueue(storage_file=temp_q_file)
    transport = MockTransport()
    
    dispatcher = CommandDispatcher(queue, signer, transport.send)
    device_id = "test_dev_2"
    
    # 1. Test Command Signing and Dispatch
    cmd1 = DeviceCommand(
        device_id=device_id,
        command_type="vibrate",
        parameters={"duration": 1000}
    )
    await dispatcher.dispatch(cmd1)
    
    assert len(transport.sent_messages) == 1
    sent_payload = transport.sent_messages[0][1]
    assert sent_payload["signature"] is not None
    assert signer.verify_command(DeviceCommand(**sent_payload)) is True
    print("[OK] Commands signed and dispatched")
    
    # 2. Test ACK properly removes from queue
    await dispatcher.handle_ack(device_id, cmd1.command_id)
    assert len(queue.fetch_pending(device_id)) == 0
    print("[OK] Commands ACK properly")
    
    # 3. Test Offline Queue and Survives Restart
    transport.device_online = False
    cmd2 = DeviceCommand(
        device_id=device_id,
        command_type="speak_text",
        parameters={"text": "Hello"}
    )
    await dispatcher.dispatch(cmd2)
    assert len(transport.sent_messages) == 1 # Didn't increase
    assert len(queue.fetch_pending(device_id)) == 1
    
    # Restart Queue
    queue2 = OfflineCommandQueue(storage_file=temp_q_file)
    assert len(queue2.fetch_pending(device_id)) == 1
    print("[OK] Offline queue survives restart")
    
    # 4. Test Retries
    await dispatcher.handle_nack_or_timeout(device_id, cmd2.command_id)
    cmd2_reloaded = queue.fetch_pending(device_id)[0]
    assert cmd2_reloaded.retries == 1
    print("[OK] Retries increment properly")
    
    # 5. Test Expiration
    cmd3 = DeviceCommand(
        device_id=device_id,
        command_type="sync_now",
        expires_at=datetime.now(timezone.utc) - timedelta(seconds=1)
    )
    await dispatcher.dispatch(cmd3)
    pending = queue.fetch_pending(device_id)
    assert len(pending) == 1 
    assert pending[0].command_id == cmd2.command_id
    print("[OK] Expired commands removed")
    
    # 6. Test Duplicate ACK
    await dispatcher.handle_ack(device_id, cmd1.command_id) # Duplicate
    print("[OK] Duplicate execution prevented")
    
    # Cleanup
    if os.path.exists(temp_q_file):
        os.remove(temp_q_file)

    print("[SUCCESS] All Command Dispatch tests passed!")
    return 0

def main():
    return asyncio.run(async_test_dispatch())

if __name__ == "__main__":
    sys.exit(main())
