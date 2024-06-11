import select

from request import Request
from response import Response
from networkConnection import NetworkConnection


class Server:
    """Abstracts away all the socket nonsense"""
    def __init__(self, network_connection: NetworkConnection):
        self.connection = network_connection
        self.routes = {'GET': {}, 'POST': {}, 'PUT': {}}
        self.middleware = []

    # PIPELINE BUILDERS
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
    
    # EXECUTION
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
    
    # TODO fix this horriffic connection.connection nonsense 
    def run(self):
        if self.connection.ip is None:
            self.connection.connect()
        if self.connection.connection is None:
            self.connection.open_server_socket()
        inputs = [self.connection.connection]
        while True:
            readable, _, _ = select.select(inputs, [], [])
            for s in readable:
                if s is self.connection.connection:
                    client, _ = self.connection.connection.accept()
                    client.setblocking(False)
                    inputs.append(client)
                else:
                    try:
                        self.handle_request(s)
                    except Exception as e:
                        print(f'Error handling request: {e}')
                    finally:
                        inputs.remove(s)
                        s.close()
        