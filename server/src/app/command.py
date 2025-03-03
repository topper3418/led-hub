from flask import Blueprint, abort, request, jsonify, g
from pydantic import ValidationError

from src.dispatcher import get_new_states
from src.dispatcher.contextCommandProcessor import ContextCommandProcessor, get_full_led_strip_context
from src.logging import get_logger
from src.db import Database
from src.models import Device, Room

from .middleware import data_has, ensure_not_none, load_device
from .funcs import update_led_strip


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
        if command.command.on is not None:
            led_strip.on = command.command.on
        if command.command.brightness is not None:
            led_strip.brightness = command.command.brightness
        if command.command.color is not None:
            led_strip.red, led_strip.green, led_strip.blue = command.command.color
        db.led_strips.update(led_strip)
    return jsonify(response.model_dump())
    
    


