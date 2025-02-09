# a server to do receive voice commands from the server

# First the plain staring comes in to the route
# then we ask the model which of the options for actions it seems like we would most likely satisfy the command
# then we ask the model to fill out the schema for the command
# then we run the verification script to make sure the command is valid
# if not, we ask it to correct it once
# then we run the command

from flask import Flask


app = Flask(__name__)


@app.route('/command', methods=['POST'])
def command():
    pass
