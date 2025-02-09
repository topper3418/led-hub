from typing import Callable

from .client import Client as SimpleClient
from .models import Device, LedState


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


