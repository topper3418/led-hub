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
        
        
        if request.route == '/lighton':
            ledStrip.turnOn()
            response.content = ledStrip.getState()
        elif request.route == '/lightoff':
            ledStrip.turnOff()
            response.content = ledStrip.getState()
        elif request.route == '/brightness':
            try:
                brightness = int(request.params.split('=')[1])
                ledStrip.setBrightness(brightness)
                response.content = ledStrip.getState()
            except (IndexError, ValueError):
                response.ingest_error('400 Bad Request', 'Invalid brightness')
        elif cmd == '/color':
            try:
                r, g, b = request.params.split('=')[1].split(',')
                ledStrip.setColor((int(r), int(g), int(b)))
                response.content = ledStrip.getState()
            except (IndexError, ValueError):
                response.ingest_error('400 Bad Request', 'Invalid color')
        
        client.send(response.render())
        client.close()


try:
    serve()
except KeyboardInterrupt:
    machine.reset()

