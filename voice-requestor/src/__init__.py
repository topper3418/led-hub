from typing import Callable

from requests import Response
from .client import Client as SimpleClient
from .models import Device, LedState


class ConnectedDevice(Device):
    def __init__(self, data: dict, write_one_callback: Callable[['ConnectedDevice'], LedState]):
        super().__init__(data)
        self.update = lambda: write_one_callback(self)


class IntegratedClient:
    def __init__(self, hub_server_endpoint: str | None = None):
        self.hub_server_endpoint = hub_server_endpoint or 'http://localhost:2000'
        self._client = SimpleClient(hub_server_endpoint)

    def read_all(self):
        devices_data = self._client.read_all()
        return [ConnectedDevice(device, self.write_one) for device in devices_data]

    def write_all(self, new_state):
        data = {
            "data": new_state.render()
        }
        response_data = self._client.write_all(data)
        return LedState.from_dict(response_data, updateResponse=True)

    def write_one(self, device: ConnectedDevice) -> LedState:
        data = {
            "data": device.state.render()
        }
        response_data = self._client.write_one(device.data.name, data)
        return LedState.from_dict(response_data, updateResponse=True)


