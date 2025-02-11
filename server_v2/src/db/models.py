from sqlite3 import Cursor
from typing import Optional
from src.models import (
    Device as DeviceModel,
    Room as RoomModel,
    LedStripState as LedStripModel,
)

class Device(DeviceModel):

    cursor: Optional[Cursor] = None


class Room(RoomModel):

    cursor: Optional[Cursor] = None


class LedStrip(LedStripModel):

    cursor: Optional[Cursor] = None



