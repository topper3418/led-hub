import network
import socket
import time

class NetworkConnection:
    """Abstracts away all the socket nonsense"""
    def __init__(self, ssid, password, 
                 static_ip_config=None, pending=None, complete=None, req_buffer=5, ):
        self.ssid = ssid
        self.password = password
        self.static_ip_config = static_ip_config
        self.pending = pending
        self.complete = complete
        self.req_buffer = req_buffer
        self.ip = None
        self.connection = None
    
    def connect(self):
        wlan = network.WLAN(network.STA_IF)
        wlan.active(True)
        wlan.connect(self.ssid, self.password)
        if self.static_ip_config:
            wlan.ifconfig(self.static_ip_config)
        while wlan.isconnected() == False:
            print('Waiting for connection...')
            if self.pending: self.pending()
            time.sleep(.5)
        ip = wlan.ifconfig()[0]
        print(f'Connected on {ip}')
        if self.complete: self.complete()
        self.ip = ip
    
    def open_server_socket(self, port=80):
        try:
            address = (self.ip, port)
            connection = socket.socket()
            connection.bind(address)
            connection.listen(self.req_buffer)
            connection.setblocking(False)
            self.connection = connection
            print(f'Socket opened on {self.ip}:{port}')
        except Exception as e:
            print(f'Failed to open socket: {e}')
        