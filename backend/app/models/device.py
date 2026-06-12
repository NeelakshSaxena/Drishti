from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.device import DeviceModel

class IDeviceRepository(ABC):
    @abstractmethod
    def save_device(self, device: DeviceModel) -> DeviceModel:
        pass

    @abstractmethod
    def get_device(self, device_id: str) -> Optional[DeviceModel]:
        pass

    @abstractmethod
    def list_devices(self, owner_id: str) -> List[DeviceModel]:
        pass

    @abstractmethod
    def delete_device(self, device_id: str) -> bool:
        pass
