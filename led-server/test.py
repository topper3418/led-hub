from pprint import pprint

request_str = b'GET /brightness?brightness=25 HTTP/1.1\r\nUser-Agent: PostmanRuntime/7.39.0\r\nAccept: */*\r\nPostman-Token: 2a263c1c-01eb-47d6-8c8c-6e55fa44cae3\r\nHost: 192.168.68.69:80\r\nAccept-Encoding: gzip, deflate, br\r\nConnection: keep-alive\r\n\r\n'


request_line, rest = request_str.decode('utf-8').split('\r\n', maxsplit=1)

headers, body = rest.split('\r\n\r\n')

print(request_line)

class Request:
    """parses the request for cleaning up code"""
    def __init__(self, request_bytes):
        self.bytes = request_bytes
        self.str = request_bytes.decode('utf-8')
        request_line, rest = self.str.split('\r\n', maxsplit=1)
        self.method, self.uri, self.http_version = request_line.split(' ')
        self.headers, self.body = rest.split('\r\n\r\n')
        self.route, self.params = self.uri.split('?')
        