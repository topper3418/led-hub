import requests

from src.models import (
    LedStrip as LedStripModel,
    Device as DeviceModel,
)


def get_state(device: DeviceModel) -> LedStripModel:
    response = requests.get(device.url)
    response.raise_for_status()
    return LedStripModel(**response.json())


def set_state(device: DeviceModel, state: LedStripModel) -> LedStripModel:
    response = requests.put(device.url, json=state.dict())
    response.raise_for_status()
    return LedStripModel(**response.json())



