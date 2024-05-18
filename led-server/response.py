import json
class Response:
    
    def __init__(self):
        self.content = ''
        self.code = '200 OK'
        self.content_type = 'application/json'
    
    def ingest_error(self, code, err):
        self.content = err
        self.code = code
        self.content_type = 'plain/text'
    
    def render(self):
        if self.content_type == 'application/json':
            content = json.dumps(self.content)
        else:
            content = self.content
        rendered_return = f"HTTP/1.1 {self.code}\r\nContent-Type: {self.content_type}\r\n\r\n{content}"
        print(f'returning {rendered_return}')
        return rendered_return
