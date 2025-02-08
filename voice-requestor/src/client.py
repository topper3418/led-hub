# a client module for sending requests to control the devices


# necessary actions: 
# - list to see what the current state of the devices are, in order to provide context to the request the user is making
# - write all
# - write one
# - add a new route for this on the server but write many

from typing import List, Tuple
import requests
from .models import Device, LedState
from logging import getLogger


logger = getLogger(__name__)


class Client:
    def __init__(self, endpoint: str | None = None):
        self.endpoint = endpoint or 'http://localhost:2000'

    def read_all(self) -> List[dict]:
        """Reads the data from all devices from the root endpoint"""
        response = requests.get(f'{self.endpoint}/')
        devices_data = response.json()
        logger.info('Read all devices', {'devices': devices_data})
        return devices_data


    def write_all(self, data: dict) -> dict:
        """sends the state to the endpoint that writes to all devices"""
        response = requests.post(f'{self.endpoint}/all', json=data)
        response_data = response.json()
        logger.info('Wrote to all devices', {'new_state': data, 'response': response_data})
        return response_data


    def write_one(self, device_name: str, data: dict) -> dict:
        """sends the state to the endpoint that writes to one device"""
        response = requests.post(f'{self.endpoint}/{device_name}', json=data)
        response_data = response.json()
        logger.info(f'Wrote to {device_name}', {"device": device_name, "payload": data, "response": response_data})
        return response_data
