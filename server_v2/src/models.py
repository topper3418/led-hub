# This is the heart of the file, when it changes there need to be coordinated changes in 
# - database dd.
# - corresponding queries
# - everywhere where the model is used


# we are going to separate the devices and their statuses, since the IOT-nature of the network means they will all at least have their mac addresses and ip addresses

from __future__ import annotations
from typing import Optional
from datetime import datetime

from pydantic import BaseModel, Field


class Device(BaseModel):
    id: Optional[int] = Field(None, description="Auto-incremented primary key")
    mac: str
    name: Optional[str] = None
    ip: str
    last_ping: Optional[datetime] = None
    room_id: Optional[int] = None
    # linked objects
    room: Optional[Room] = None
    led_strip: Optional[LedStrip] = None
    # helpers
    @property
    def url(self) -> str:
        return f"http://{self.ip}:{self.port}"
    def create_led_strip_state(self) -> LedStrip:
        return LedStrip(device_id=self.id)


class Color(BaseModel):
    r: int = Field(ge=0, le=255)
    g: int = Field(ge=0, le=255)
    b: int = Field(ge=0, le=255)


class LedStrip(BaseModel):
    id: Optional[int] = Field(None, description="Auto-incremented primary key")
    device_id: int
    on: bool = False
    brightness: int = Field(0, ge=0, le=255)
    red: int = Field(0, ge=0, le=255)
    green: int = Field(0, ge=0, le=255)
    blue: int = Field(0, ge=0, le=255)
    num_leds: int = Field(10, ge=0)
    # linked objects
    device: Optional[Device] = None
    room: Optional[Room] = None
    # helpers
    @property
    def color(self) -> Color:
        return Color(r=self.red, g=self.green, b=self.blue)
    @color.setter
    def color(self, new_color: Color):
        self.red = new_color.r
        self.green = new_color.g
        self.blue = new_color.b


class Room(BaseModel):
    id: Optional[int] = Field(None, description="Auto-incremented primary key")
    name: str
    # linked objects
    devices: list[Device] = []
    led_strip_states: list[LedStrip] = []
