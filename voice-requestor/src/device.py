#   {
#         "id": 7,
#         "mac": "28:cd:c1:11:96:f5",
#         "type": "LedStrip",
#         "name": "DevPi",
#         "current_ip": "192.168.68.72",
#         "current_port": "80",
#         "on": 0,
#         "brightness": 255,
#         "color": {
#             "r": 255,
#             "g": 255,
#             "b": 255
#         },
#         "connected": false
#     },

from typing import List
import requests
from dataclasses import dataclass


class DeviceParsingError(Exception): 
    pass


class PayloadParser:
    attr_map = {}

    def __init__(self, data):
        self._safe_parse(data)

    def _parse(self, data):
        for attr, (type_, key) in self.attr_map.items():
            setattr(self, attr, type_(data[key]))

    def _safe_parse(self, data):
        try:
            self._parse(data)
        except KeyError as e:
            raise DeviceParsingError(f'{self.__class__.__name__} data is missing key: {e}')
        except ValueError as e:
            raise DeviceParsingError(f'{self.__class__.__name__} data has invalid value: {e}')
        except Exception as e:
            raise DeviceParsingError(f'parsing {self.__class__.__name__} data caused unexpected error: {e}')

    @property
    def json(self):
        temp_dict = {}
        for attr, (type_, key) in self.attr_map.items():
            value = getattr(self, attr)
            if isinstance(value, PayloadParser):
                temp_dict[attr] = value.json
            else:
                temp_dict[attr] = value
        return temp_dict


class Color(PayloadParser): 
    attr_map = {
        'red': (int, 'r'),
        'green': (int, 'g'),
        'blue': (int, 'b')
    }


class LedState: 
    def __init__(self, deviceData: dict):
        try:
            self.on = bool(deviceData['on'])
            self.brightness = int(deviceData['brightness'])
            self.color = Color(deviceData['color'])
        except KeyError as e:
            raise DeviceParsingError(f'LedState data missing key: {e}')
        except ValueError as e:
            raise DeviceParsingError(f'LedState data has invalid value: {e}')

    @property
    def json(self):
        return {
            'on': self.on,
            'brightness': self.brightness,
            'color': self.color.json
        }


class Device:
    def __init__(self, deviceData: dict):
        self._data = deviceData
        try:
            self.name = deviceData['name']
            self.mac = deviceData['mac']
            self.connected = bool(deviceData['connected'])
            self.state = LedState(deviceData)
        except KeyError as e:
            raise DeviceParsingError(f'Device data missing key: {e}')
        except ValueError as e:
            raise DeviceParsingError(f'Device data has invalid value: {e}')

    @property
    def is_connected(self):
        return self.connected

    @property
    def json(self):
        return {
            'name': self.name,
            'connected': self.connected,
            'state': self.state.json
        }
    
    @classmethod
    def from_response(cls, response: requests.Response) -> List['Device']:
        return [cls(data) for data in response.json()]

