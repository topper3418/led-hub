# module imports
import machine
import requests
import json
import socket
import time

# custom module imports
from ledStrip import LedStrip
from request import Request
from response import Response
from server import Server
from getMac import get_mac_address
from networkConnection import NetworkConnection
from boardLed import BoardLed

from config import (SSID, 
                    PASSWORD,
                    HANDSHAKE_ENDPOINT,
                    DEVICE_NAME)


# gpio 
ledStrip = LedStrip(4, 30)
boardLed = BoardLed()
# server
connection = NetworkConnection(SSID, PASSWORD, pending=boardLed.toggle, complete=boardLed.turnOn)
server = Server(connection)


# middleware and scripts

bigQuote = '"""'
def log_request(req: Request, _):
    print(f"new request: \n{bigQuote}\n{req}\n{bigQuote}\n\n")


def log_response(_, res: Response):
    print(f"returning response: \n{bigQuote}\n{res.render()}\n{bigQuote}\n\n")
    

def handshake(connection):
    """sends a request to the server to register the device"""
    
    mac = get_mac_address()
    print(f'got mac: {mac}')
    
    headers = {
        "content-type": "application/json"
    }
    
    
    handshake_data = {
        'mac': mac,
        'type': 'LedStrip',
        'ip': connection.ip,
        'name': DEVICE_NAME,
        'port': 80
    }
    
    try:
        print(f'attempting handshake with at "{HANDSHAKE_ENDPOINT}')
        res = requests.post(HANDSHAKE_ENDPOINT, json=handshake_data, headers=headers)
        if res.status_code == 200:
            print('handshake successful')
        else: 
            print('handshake failed')
            return False
        res_json = res.json()
        print(f'received response:\n', res_json)
        return True
    except Exception as e:
        print('error during handshake:', e)
        return False



# build pipeline

server.use(log_request)


@server.route('GET', '/')
def get_data(_, res: Response):
    """returns the state of the LED strip"""
    res.content = ledStrip.getState()


@server.route('POST', '/')
def set_strip(req: Request, res: Response):
    """depending on params, changes the state of the LED strip and returns 
    the state"""
    if 'brightness' in req.body:
        print('setting brightness')
        ledStrip.setBrightness(int(req.body['brightness']))
    if 'on' in req.body:
        if req.body['on']:
            print('turning on')
            ledStrip.turnOn()
        else:
            print('turning off')
            ledStrip.turnOff()
    if 'color' in req.body:
        print('setting color')
        ledStrip.setColor(req.body['color'])   
    res.content = ledStrip.getState()


server.use(log_response)


# execution

if __name__ == '__main__':
    try:
        # connect to network
        connection.connect()
        # first do a handshake with the server to register the device
        while not handshake(connection):
            time.sleep(1)
            boardLed.toggle()
        boardLed.turnOn()
        server.run()
    except KeyboardInterrupt:
        machine.reset()

