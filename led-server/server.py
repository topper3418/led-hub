import network
import socket
import time

from boardLed import BoardLed
from request import Request
from response import Response

boardLed = BoardLed()

class Server:
    """Abstracts away all the socket nonsense"""
    def __init__(self, ssid, password, static_ip_config=None):
        self.ssid = ssid
        self.password = password
        self.ip = None
        self.connection = None
        self.routes = {'GET': {}, 'POST': {}, 'PUT': {}}
        self.middleware = []
        self.static_ip_config = static_ip_config
    
    def connect(self):
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        wlan.connect(self.ssid, self.password)
        if self.static_ip_config:
            wlan.ifconfig(self.static_ip_config)
        while wlan.isconnected() == False:
            print('Waiting for connection...')
            boardLed.toggle()
            time.sleep(.5)
        ip = wlan.ifconfig()[0]
        print(f'Connected on {ip}')
        boardLed.turnOn()
        self.ip = ip
    
    def open_socket(self):
        try:
            address = (self.ip, 80)
            connection = socket.socket()
            connection.bind(address)
            connection.listen(1)
            self.connection = connection
            print(f'Socket opened on {self.ip}:80')
        except Exception as e:
            print(f'Failed to open socket: {e}')

    def use(self, func):
        """Adds a middleware function to be executed for every request"""
        self.middleware.append(func)
    
    def route(self, method, path):
        def decorator(func):
            self.routes[method][path] = func
            return func
        return decorator

    def apply_middleware(self, middleware):
        def decorator(func):
            def wrapped_func(request, response):
                for middleware_func in middleware:
                    middleware_func(request, response)
                return func(request, response)
            return wrapped_func
        return decorator
    
    def handle_request(self, client):
        request = Request(client.recv(1024))
        response = Response()

        # run global middleware
        for middleware_func in self.middleware:
            middleware_func(request, response)
        handler = self.routes.get(request.method, {}).get(request.route, None)
        if handler:
            try:
                handler(request, response)
            except Exception as e:
                response.ingest_error('500 Internal Server Error', str(e))
        else:
            response.ingest_error('404 Not Found', 'The requested resource was not found.')
        
        client.send(response.render())
        client.close()
    
    def run(self):
        self.connect()
        self.open_socket()
        while True:
            client = self.connection.accept()[0]
            self.handle_request(client)
        