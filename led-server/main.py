# module imports
import machine
import urequests
import json
import socket

# custom module imports
from ledStrip import LedStrip
from request import Request
from response import Response
from server import Server
from getMac import get_mac_address

# from config import (ssid, 
#                     password, 
#                     static_ip_config)

ssid = "the way of the wamel"
password = 'Maisie129'
static_ip = '192.168.68.69'
subnet_mask = '255.255.255.0'
gateway = '192.168.68.1'
dns_server = '8.8.8.8'

static_ip_config = (static_ip, subnet_mask, gateway, dns_server)

SERVER_IP = '192.168.68.73'
SERVER_PORT = 2000
HANDSHAKE_ENDPOINT = f'http://{SERVER_IP}:{SERVER_PORT}/stripData'


# gpio objects
ledStrip = LedStrip(4, 30)
server = Server(ssid, password)#, static_ip_config)

def log_request(req: Request, _):
    print(req)
    

# def handshake():
#     """sends a request to the server to register the device"""
    
#     mac = get_mac_address()
#     print(f'mac address retrieved: {mac}')
#     handshake_data = {
#         'mac': mac,
#         'type': 'reboot',
#     }
    
#     try:
#         print('before request')
#         res = urequests.post(HANDSHAKE_ENDPOINT, json=handshake_data)
#         print('after request')
#         if res.status_code == 200:
#             print('handshake successful')
#         else: 
#             print('handshake failed')
#             machine.reset()
#         print('about to parse response')
#         res_json = res.json()
#         print(res_json)
#         return True
#     except Exception as e:
#         print('error during handshake:', e)
#         return False
  

def handshake():
    """Sends a request to the server to register the device"""
    mac = get_mac_address()
    print(f'MAC address retrieved: {mac}')
    handshake_data = {
        'mac': mac,
        'type': 'reboot',
    }
    handshake_data_str = json.dumps(handshake_data)
    
    request = f"POST {HANDSHAKE_ENDPOINT} HTTP/1.1\r\n"
    request += f"Host: {SERVER_IP}\r\n"
    request += "Content-Type: application/json\r\n"
    request += f"Content-Length: {len(handshake_data_str)}\r\n"
    request += "\r\n"
    request += handshake_data_str
    
    try:
        print('Before request')
        
        addr_info = socket.getaddrinfo(SERVER_IP, SERVER_PORT)
        addr = addr_info[0][-1]
        
        sock = socket.socket()
        sock.connect(addr)
        sock.send(request.encode())
        
        print('After request')
        
        response = sock.recv(1024)
        print('Response:', response.decode())
        
        sock.close()
        
        if "200 OK" in response.decode():
            print('Handshake successful')
        else:
            print('Handshake failed')
            machine.reset()
            
    except Exception as e:
        print('Error during handshake:', e)
        machine.reset()  

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
        # first do a handshake with the server to register the device
        while not handshake():
            pass
        handshake()
        server.run()
    except KeyboardInterrupt:
        machine.reset()

