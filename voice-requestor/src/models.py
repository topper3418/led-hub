from __future__ import annotations
from typing import List
from dataclasses import dataclass
from requests import Response
from pydantic import BaseModel, Field, PositiveInt

# this module will provide objects to cleanly parse
# {
#     "id": 7,
#     "mac": "28:cd:c1:11:96:f5",
#     "type": "LedStrip",
#     "name": "DevPi",
#     "current_ip": "192.168.68.72",
#     "current_port": "80",
#     "on": 0,
#     "brightness": 255,
#     "color": {
#         "r": 255,
#         "g": 255,
#         "b": 255
#     },
#     "connected": false
# }


class Color(BaseModel):
    r: int = Field(ge=0, le=255)
    g: int = Field(ge=0, le=255)
    b: int = Field(ge=0, le=255)


class LedState(BaseModel): 
    on: bool | None = None
    brightness: int | None = Field(ge=0, le=255)
    color: Color = Color(r=0,g=0,b=0)
    # connected is optional
    connected: bool | None = None


class DeviceData(BaseModel):
    name: str
    mac: str


class Device(LedState, DeviceData):
    
    @property
    def LedState(self) -> LedState:
        return LedState(on=self.on, brightness=self.brightness, color=self.color, connected=self.connected)
