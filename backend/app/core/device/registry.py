from typing import List, Optional
from app.models.device import IDeviceRepository
from app.schemas.device import DeviceModel

class DeviceRegistry:
    def __init__(self, repository: IDeviceRepository):
        self.repository = repository

    def register_device(self, name: str, owner_id: str, capabilities: list = None) -> DeviceModel:
        device = DeviceModel(
            name=name,
            owner_id=owner_id,
            capabilities=capabilities or []
        )
        return self.repository.save_device(device)

    def get_device(self, device_id: str) -> Optional[DeviceModel]:
        return self.repository.get_device(device_id)

    def list_user_devices(self, owner_id: str) -> List[DeviceModel]:
        return self.repository.list_devices(owner_id)
        
    def unregister_device(self, device_id: str) -> bool:
        return self.repository.delete_device(device_id)
