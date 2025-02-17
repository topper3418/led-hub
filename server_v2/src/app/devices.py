from flask import Blueprint, abort, request, jsonify, g
from pydantic import ValidationError

from src.logging import get_logger
from src.db import Database
from src.models import Device

from .middleware import data_has, ensure_not_none, load_device
from .funcs import update_led_strip


logger = get_logger(__name__)
devices_bp = Blueprint('devices', __name__)


devices_bp.before_request(load_device)


@devices_bp.get('/')
def get_devices():
    logger.info('processing request to list devices')
    room_id = request.args.get('room_id')
    with Database() as db:
        devices = db.devices.find_many(None if not room_id else int(room_id))
    device_data = [device.model_dump() for device in devices or []]
    return jsonify({"data": {"devices": device_data}})


@devices_bp.post('/')
def handshake():
    body = request.json
    if not body:
        return jsonify({"error": "No data provided"}), 400
    device_data = body.get('data')
    logger.info('processing handshake request', {'device_data': device_data})
    try:
        device = Device(**device_data)
    except ValidationError as e:
        error_message = "Error parsing device data"
        logger.error(error_message, {"error": e.errors()})
        return jsonify({"error": error_message, "details": e.errors()}), 400
    with Database() as db:
        existing_device = db.devices.find_by_mac(device.mac)
    if existing_device:
        existing_message = "Device already exists"
        logger.debug(existing_message)
        return jsonify({"message": existing_message, "data": existing_device.model_dump()}), 200
    with Database() as db:
        db.devices.create(device)
        led_strip_state = device.create_led_strip_state()
        db.led_strips.create(led_strip_state)
    success_message = "Device created"
    model_data = device.model_dump()
    logger.info(success_message, {"data": model_data})
    return jsonify({"message": success_message, "data": model_data}), 201


@devices_bp.put('/<int:device_id>')
@ensure_not_none('device')
def update_device(device_id):
    logger.debug(f'received request to modify device data for device id {device_id}')
    # load the device
    device: Device = g.get('device')
    # parse the data
    body = request.json or {}
    data = body.get('data')
    if not data: 
        error_message = "No data provided"
        logger.error(error_message)
        return jsonify({"error": error_message}), 400
    logger.info(f'processing request to update device with mac {device.mac}', {"device": device.model_dump(), "body": body})
    # update the name if given
    name = data.get('name')
    if name:
        device.name = name
    # update the room if given
    room_id = data.get('room_id')
    if room_id:
        with Database() as db:
            room = db.rooms.find_by_id(room_id)
        if room is None:
            error_message = f"No room found with id {room_id}"
            logger.error(error_message)
            return jsonify({"error": error_message }), 404
        device.room_id = room_id
    # update the database
    with Database() as db:
        db.devices.update(device)
    # return the data
    device_data = device.model_dump()
    success_message = "successfully updated device"
    logger.info(success_message, {"device": device_data})
    return jsonify({"data": {"device": device_data, "message": success_message}})


@devices_bp.get('/<int:device_id>')
@ensure_not_none('device')
def read_device(device_id):
    logger.debug(f'processing request for data on device id {device_id}')
    # load the device and state
    device = g.get('device')
    with Database() as db:
        device.led_strip = db.led_strips.find_by_device_id(device_id)
    # return the data
    device_data = device.model_dump()
    logger.debug(f'returning value for device "{device.name or device.mac}"', {"device": device_data})
    return jsonify({"data": {"device": device_data}})


@devices_bp.put('/<int:device_id>/led_strip>')
@data_has('color', optional=True)
@data_has('brightness', optional=True)
@data_has('on', optional=True)
@ensure_not_none('device')
def update_led_strip_state(device_id):
    logger.info(f'updating led strip state for device id {device_id}', {"data", g.data})
    device: Device = g.device
    # load that device from the db
    db: Database = g.db
    led_strip = db.led_strips.find_by_device_id(device_id)
    device.led_strip = led_strip
    g.led_strip = led_strip
    return update_led_strip()


@devices_bp.get('/<int:device_id>/led_strip>')
@ensure_not_none('device')
def get_led_strip_state(device_id):
    logger.debug(f'processing request for led strip data on device id {device_id}')
    # load that device from the db
    db: Database = g.db
    led_strip = db.led_strips.find_by_device_id(device_id)
    if led_strip is None:
        abort(500, f"There was an error loading the led strip data for device id {device_id}")
    led_strip_data = led_strip.model_dump()
    logger.debug(f'returning data for led strip on device id {device_id}', led_strip_data)
    return jsonify({"data": led_strip_data})
    
