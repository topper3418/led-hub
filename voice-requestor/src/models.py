from __future__ import annotations
from typing import List
from dataclasses import dataclass
from requests import Response

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


@dataclass
class Color:
    red: int
    green: int
    blue: int


@dataclass
class LedState: 
    on: bool
    brightness: int
    color: Color
    connected: bool | None

    def render(self):
        return {
            "on": self.on,
            "brightness": self.brightness,
            "color": {
                "r": self.color.red,
                "g": self.color.green,
                "b": self.color.blue
            },
            "connected": self.connected
        }

    @classmethod
    def from_dict(cls, data: dict, updateResponse: bool = False):
        return cls(
            on=bool(data['on']),
            brightness=int(data['brightness']),
            color=Color(
                red=int(data['color']['r'] or 0),
                green=int(data['color']['g'] or 0),
                blue=int(data['color']['b'] or 0)     
            ),
            connected=None if updateResponse else bool(data['connected'])
        )

    def __repr__(self):
        if self.connected:
            return f'<LedState {"ON" if self.on else "OFF"} {self.brightness} {self.color} >'
        else: 
            return f'<LedState DISCONNECTED>'


@dataclass
class DeviceData:
    name: str
    mac: str


class Device:
    def __init__(self, data: dict):
        self.data = DeviceData(
            name=data['name'],
            mac=data['mac']
        )
        self.state = LedState.from_dict(data)

    def __repr__(self):
        return f'<Device {self.data.name}>'

    @classmethod
    def from_response(cls, response: Response) -> List[Device]:
        devices = response.json()
        return [cls(device) for device in devices]
