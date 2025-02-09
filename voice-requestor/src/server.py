# a server to do receive voice commands from the server

# First the plain staring comes in to the route
# then we ask the model which of the options for actions it seems like we would most likely satisfy the command
# then we ask the model to fill out the schema for the command
# then we run the verification script to make sure the command is valid
# if not, we ask it to correct it once
# then we run the command

from flask import Flask, request
from .dispatcher import ThoughtProcess


app = Flask(__name__)


@app.route('/command', methods=['POST'])
def command():
    command = request.json.get('command')
    if command is None:
        return {'error': 'no command provided'}, 400
    thought = ThoughtProcess(command)
    # get a dictionary of commands to send to the devices
    commands = thought.think()
    # then send the commands to the devices using the writemany method
    updated_devices = thought.client.write_many(commands.device_commands.values())
    return {'devices': [device.model_dump() for device in updated_devices]}


