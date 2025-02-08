# a server to do receive voice commands from the server
from flask import Flask


app = Flask(__name__)

@app.route('/command', methods=['POST'])
def command():
    pass
