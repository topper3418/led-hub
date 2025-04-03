# schema:
# /
#   POST - process_voice_command - process a plain text command


from flask import Blueprint, jsonify, g

from src.dispatcher.contextCommandProcessor import ContextCommandProcessor, get_full_led_strip_context
from src.logging import get_logger
from src.db import Database

from .middleware import data_has


logger = get_logger(__name__)
command_bp = Blueprint('command', __name__)


@command_bp.post('/')
@data_has('command')
def process_voice_command():
    command = g.get('command')
    db: Database = g.db
    logger.debug('received command to process', {'command': command})
    # get the devices and their current state
    context = get_full_led_strip_context(db)
    # get the processor
    processor = ContextCommandProcessor(context)
    # process the command
    response = processor.process_command(command)
    # update the devices
    for command in response.commands:
        led_strip = db.led_strips.find_by_device_id(command.device_id)
        if led_strip is None:
            response.errors.append(f"Device with id {command.device_id} not found")
            continue
        if command.set_on is not None:
            led_strip.on = command.set_on
        if command.set_brightness is not None:
            led_strip.brightness = command.set_brightness
        if command.set_color is not None:
            led_strip.red, led_strip.green, led_strip.blue = command.set_color
        db.led_strips.update(led_strip)
    # return the response
    response_data = response.model_dump()
    logger.debug('processed command', {'response': response_data})
    return jsonify(response_data)
    
    


