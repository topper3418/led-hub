from flask import Blueprint, request, jsonify, g
from pydantic import ValidationError

from src.dispatcher import ThoughtProcess
from src.logging import get_logger
from src.db import Database
from src.models import Device

from .middleware import data_has, ensure_not_none, load_device
from .funcs import update_led_strip


logger = get_logger(__name__)
command_bp = Blueprint('command', __name__)


@command_bp.route('/')
def process_voice_command():
    logger.debug('received command to process')
    # parse the data
    body = request.json or {}
    data = body.get('data')
    if not data: 
        error_message = "No data provided"
        logger.error(error_message)
        return jsonify({"error": error_message}), 400
    # get the command
    command = data.get('command')
    if not command:
        error_message = "No command provided"
        logger.error(error_message)
        return jsonify({"error": error_message}), 400
    # get the devices and their current state
    db: Database = g.db
    devices = db.devices.find_many(connected=True)
    if not devices:
        error_message = "devices must be retrievable and connected for the voice command to work"
        logger.error(error_message)
        return jsonify({"error": error_message}), 500
    thought_process = ThoughtProcess(command, devices)
    thought_process.think()
    # work through the device states and push
    update_promises = []
    devices = []
    for device_name, state in thought_process.device_states.items():
        logger.debug(f'attempting to update device {device_name}', {"state": state.model_dump()})
        device = db.devices.find_by_name(device_name)
        if device is None:
            abort(500, "dispatcher made up a device name")
        db.led_strips.update(state)
        device.led_strip_state = state
        devices.append(device)
    success_message = "Successfully processed command and wrote to devices"
    device_data = [device.model_dump() for device in devices]
    logger.info(success_message, {"devices": device_data, "command": command})
    return jsonify({"data": {"devices": device_data, "message": success_message}})



