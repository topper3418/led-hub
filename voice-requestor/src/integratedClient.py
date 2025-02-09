from typing import Callable, List

from .client import Client as SimpleClient
from .models import Device, DeviceCommand, LedState, ProcessedVoiceCommand
from .logging import getLogger

logger = getLogger(__name__)

class IntegratedClient:
    def __init__(self, hub_server_endpoint: str | None = None):
        self.hub_server_endpoint = hub_server_endpoint or 'http://localhost:2000'
        self._client = SimpleClient(hub_server_endpoint)

    def read_all(self):
        devices_data = self._client.read_all()
        return [Device(**data) for data in devices_data]

    def write_all(self, new_state):
        data = {
            "data": new_state.model_dump()
        }
        response_data = self._client.write_all(data)
        return LedState(**response_data)

    def write_one(self, device: Device) -> LedState:
        data = {
            "data": device.LedState.model_dump()
        }
        response_data = self._client.write_one(device.name, data)
        return LedState(**response_data)

    def write_many(self, devices: List[Device]) -> List[Device]:
        data = {
            "data": { "devices": [device.model_dump() for device in devices] }
        }
        response_data = self._client.write_many(data)
        logger.debug('received response from write_all command', {"request payload": data, "response payload": response_data})
        return [Device(**response) for response in response_data]
