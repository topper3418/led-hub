# This is the heart of the file, when it changes there need to be coordinated changes in 
# - database dd.
# - corresponding queries
# - everywhere where the model is used


# we are going to separate the devices and their statuses, since the IOT-nature of the network means they will all at least have their mac addresses and ip addresses

from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class Device(BaseModel):
    id: Optional[int] = Field(None, description="Auto-incremented primary key")
    mac: str
    ip: str
    name: Optional[str] = None
    connected: bool = False
    port: int
    # linked objects
    room: Optional[Room] = None
    led_strip: Optional[LedStrip] = None
    # helpers
    @property
    def url(self) -> str:
        return f"http://{self.ip}:{self.port}"


class LedStrip(BaseModel):
    id: Optional[int] = Field(None, description="Auto-incremented primary key")
    device_id: int
    on: bool
    brightness: int = Field(0, ge=0, le=255)
    red: int = Field(0, ge=0, le=255)
    green: int = Field(0, ge=0, le=255)
    blue: int = Field(0, ge=0, le=255)
    # linked objects
    device: Optional[Device] = None
    room: Optional[Room] = None


class Room(BaseModel):
    id: Optional[int] = Field(None, description="Auto-incremented primary key")
    name: str
    # linked objects
    devices: list[Device] = []
    led_strips: list[LedStrip] = []
