# module imports
from time import sleep
import network
import socket

# custom module imports
from boardLed import BoardLed
from ledStrip import LedStrip
from request import Request
from response import Response

# config variables
debugKnob = False


# networking variables
ssid = 'the way of the wamel'
password = 'Maisie129'
last_command = '/lightoff?'


# gpio objects
ledStrip = LedStrip(4, 30)
boardLed = BoardLed()


def connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while wlan.isconnected() == False:
        print('Waiting for connection...')
        boardLed.toggle()
        sleep(1)
    ip = wlan.ifconfig()[0]
    print(f'Connected on {ip}')
    boardLed.turnOn()
    return ip


def open_socket(ip):
    address = (ip, 80)
    connection = socket.socket()
    connection.bind(address)
    connection.listen(1)
    return connection


def accept_request(client):
    return Request(client.recv(1024))


def serve():
    """serves the connection for the webpage"""
    ip = connect()
    connection = open_socket(ip)
    while True:
        # get connection/request
        client = connection.accept()[0]
        request = accept_request(client)
        print(f'uri: {request.uri}')
        
            
        response = Response()
        
        
        print(f'params: {request.params}')
        
        response.content = ledStrip.getState()
        
        if request.method == 'POST':
            try:
                if 'brightness' in request.params:
                    print('setting brightness')
                    ledStrip.setBrightness(int(request.params['brightness']))
                if 'state' in request.params:
                    if request.params['state'] == 'on':
                        print('turning on')
                        ledStrip.turnOn()
                    else:
                        print('turning off')
                        ledStrip.turnOff()
                if 'color' in request.params:
                    print('setting color')
                    color_strs = request.params['color'].strip('()').split(',')
                    color = tuple(int(color_val) for color_val in color_strs)
                    ledStrip.setColor(color)
            except Exception as e:
                response.ingest_error('400 Bad Request', str(e))
        
        client.send(response.render())
        client.close()


try:
    serve()
except KeyboardInterrupt:
    machine.reset()

