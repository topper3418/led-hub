
class Request:
    """parses the request for cleaning up code"""
    def __init__(self, request_bytes):
        self.bytes = request_bytes
        self.str = request_bytes.decode('utf-8')
        request_line, rest = self.str.split('\r\n', 1)
        self.method, self.uri, self.http_version = request_line.split(' ')
        self.headers, self.body = rest.split('\r\n\r\n')
        self.route, self.params = self.uri.split('?') if '?' in self.uri else [self.uri, '']