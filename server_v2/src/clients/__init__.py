from src.models import (
    LedStrip as LedStripModel,
    Device as DeviceModel,
)

from .led_strip import get_state, set_state


class LedStripClient:

    def __init__(self, device: DeviceModel):
        self.device: DeviceModel = device
        self.state: LedStripModel | None = None

    def get_state(self) -> LedStripModel:
        self.state = get_state(self.device)
        return self.state

    def set_state(self, state: LedStripModel) -> LedStripModel:
        self.state = set_state(self.device, state)
        return self.state

