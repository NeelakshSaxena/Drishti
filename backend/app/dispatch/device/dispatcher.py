from app.commands.device.schemas import DeviceCommand
from app.queue.device.offline_queue import OfflineCommandQueue
from app.commands.device.signer import CommandSigner
from typing import Dict, Any, Callable
import logging

logger = logging.getLogger(__name__)

class CommandDispatcher:
    def __init__(self, queue: OfflineCommandQueue, signer: CommandSigner, send_callback: Callable):
        self.queue = queue
        self.signer = signer
        self.send_callback = send_callback 
        self.acked_commands = set()

    async def dispatch(self, command: DeviceCommand):
        self.signer.sign_command(command)
        self.queue.enqueue(command)
        await self._attempt_send(command)

    async def _attempt_send(self, command: DeviceCommand):
        success = await self.send_callback(command.device_id, command.model_dump(mode='json'))
        if success:
            command.status = "sent"
            self.queue.save()
        else:
            logger.info(f"Device offline. Command {command.command_id} queued.")

    async def handle_ack(self, device_id: str, command_id: str):
        if command_id in self.acked_commands:
            logger.warning(f"Duplicate ACK received for {command_id}")
            return
            
        self.acked_commands.add(command_id)
        self.queue.remove(device_id, command_id)
        logger.info(f"Command {command_id} ACKed by {device_id}")

    async def handle_nack_or_timeout(self, device_id: str, command_id: str):
        pending = self.queue.fetch_pending(device_id)
        for cmd in pending:
            if cmd.command_id == command_id:
                cmd.retries += 1
                if cmd.retries > cmd.max_retries:
                    logger.warning(f"Command {command_id} exceeded max retries.")
                    self.queue.remove(device_id, command_id)
                else:
                    self.queue.save()
                break

    async def process_queue_for_device(self, device_id: str):
        pending = self.queue.fetch_pending(device_id)
        for cmd in pending:
            await self._attempt_send(cmd)
