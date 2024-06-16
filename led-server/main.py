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

# from config import (ssid, 
#                     password, 
#                     static_ip_config)

ssid = "the way of the wamel"
password = 'Maisie129'

# hopefully deprecate this static ip stuff soon
static_ip = '192.168.68.69'
subnet_mask = '255.255.255.0'
gateway = '192.168.68.1'
dns_server = '8.8.8.8'

static_ip_config = (static_ip, subnet_mask, gateway, dns_server)
# end deprecation wish

SERVER_ADDRESS = '192.168.68.73'
SERVER_PORT = 4000
HANDSHAKE_ENDPOINT = f'http://{SERVER_ADDRESS}:{SERVER_PORT}/'
print(f'Handshake endpoint: {HANDSHAKE_ENDPOINT}')


# gpio 
ledStrip = LedStrip(4, 30)
boardLed = BoardLed()
# server
connection = NetworkConnection(ssid, password, pending=boardLed.toggle, complete=boardLed.turnOn)
server = Server(connection)

def log_request(req: Request, _):
    print(req)
    

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
        'name': 'DevPi'
    }
    
    try:
        print('before request')
        res = requests.post(HANDSHAKE_ENDPOINT, json=handshake_data, headers=headers)
        print('after request')
        if res.status_code == 200:
            print('handshake successful')
        else: 
            print('handshake failed')
            return False
        print('about to parse response')
        res_json = res.json()
        print(res_json)
        return True
    except Exception as e:
        print('error during handshake:', e)
        return False

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
    if 'state' in req.body:
        if req.body['state'] == 'on':
            print('turning on')
            ledStrip.turnOn()
        else:
            print('turning off')
            ledStrip.turnOff()
    if 'color' in req.body:
        print('setting color')
        color_strs = req.body['color']
        color = tuple(int(color_val) for color_val in color_strs)
        ledStrip.setColor(color)   
    res.content = ledStrip.getState()

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

