from src.models import (
    LedStripState as LedStripModel,
    Device as DeviceModel,
)
import asyncio

from .led_strip import get_state, set_state


class LedStripClient:

    def __init__(self, device: DeviceModel):
        self.device: DeviceModel = device
        self.state: LedStripModel | None = None

    def get_state(self) -> LedStripModel:
        self.state = get_state(self.device)
        self.device.led_strip_state = self.state
        return self.state

    async def get_state_async(self) -> LedStripModel:
        return self.get_state()

    def set_state(self, state: LedStripModel) -> LedStripModel:
        self.state = set_state(self.device, state)
        self.device.led_strip_state = self.state
        return self.state

    async def set_state_async(self, state: LedStripModel) -> LedStripModel:
        return self.set_state(state)
