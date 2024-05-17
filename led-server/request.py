class Request:
    """parses the request for cleaning up code"""
    def __init__(self, request_bytes):
        self.bytes = request_bytes
        self.str = request_bytes.decode('utf-8')
        request_line, rest = self.str.split('\r\n', 1)
        self.method, self.uri, self.http_version = request_line.split(' ')
        self.headers, self.body = rest.split('\r\n\r\n')
        self.route, param_str = self.uri.split('?') if '?' in self.uri else [self.uri, '']
        # convert the params into a dict
        param_list = [param.split('=') for param in param_str.split('&')] if param_str else []
        self.params = {key: value for key, value in param_list}
    
    def __repr__(self):
        return f'{self.method} on {self.route}; {self.params}'