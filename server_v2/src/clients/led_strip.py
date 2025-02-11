import requests

from src.models import (
    LedStripState as LedStripModel,
    Device as DeviceModel,
)
from src.logging import get_logger

logger = get_logger(__name__)


def get_state(device: DeviceModel) -> LedStripModel:
    logger.debug(f'reading from device {device.name}', {'device': device.model_dump()})
    response = requests.get(device.url)
    response.raise_for_status()
    state = LedStripModel(**response.json())
    logger.info(f'successfully read from device {device.name}', {'device': device.model_dump(), 'status': state.model_dump()})
    return state


def set_state(device: DeviceModel, state: LedStripModel) -> LedStripModel:
    logger.debug(f'writing to device {device.name}', {'device': device.model_dump(), 'state': state.model_dump()})
    response = requests.put(device.url, json=state.model_dump())
    response.raise_for_status()
    new_state = LedStripModel(**response.json())
    logger.info(f'successfully wrote to device {device.name}', {'device': device.model_dump(), 'state': new_state.model_dump()})
    return new_state



