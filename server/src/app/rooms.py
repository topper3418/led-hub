from flask import Blueprint, jsonify, g, request
from pydantic import ValidationError

from src.logging import get_logger
from src.db import Database
from src.models import Room

from .middleware import data_has, ensure_not_none, load_room


logger = get_logger(__name__)
rooms_bp = Blueprint('rooms', __name__)


rooms_bp.before_request(load_room)


@rooms_bp.get('/')
def list_rooms():
    logger.info('processing request to list rooms')
    db: Database = g.db
    rooms = db.rooms.find_many()
    room_data = [room.model_dump() for room in rooms or []]
    return jsonify({"data": {"rooms": room_data}})


@rooms_bp.post('/')
@data_has('name', optional=True)
def create_room():
    logger.info('processing create room request', {'room_data': g.data})
    db: Database = g.db
    try:
        if not g.data.get('name'):
            all_rooms = db.rooms.find_many() or []
            room_ids = [room.id or 0 for room in all_rooms]
            max_id = max(room_ids or [0])
            name = f"Room {max_id + 1}"
        else:
            name = g.data['name']
        room = Room(name=name)
    except ValidationError as e:
        error_message = "Error parsing room data"
        logger.error(error_message, {"error": e.errors()})
        return jsonify({"error": error_message, "details": e.errors()}), 400
    db.rooms.create(room)
    success_message = "Room created"
    model_data = room.model_dump()
    logger.info(success_message, {"data": model_data})
    return jsonify({"message": success_message, "data": model_data}), 201


@rooms_bp.get('/<int:room_id>')
@ensure_not_none('room')
def get_room(room_id):
    room = g.room
    include = request.args.get('include') or ""
    logger.info('processing get room request', {'room_id': room_id, 'include': include})
    if 'led_strip_devices' in include:
        room.devices = [device.model_dump() for device in g.db.led_strips.find_many_devices(room_id) or []]
    elif 'led_strips' in include:
        room.led_strips = [led_strip.model_dump() for led_strip in g.db.led_strips.find_many(room_id) or []]
    if 'devices' in include:
        room.devices = [device.model_dump() for device in g.db.devices.find_many(room_id) or []]
    room_data = room.model_dump()
    logger.debug('room data', {"data": room_data})
    return jsonify({"data": {"room": room_data}})


@rooms_bp.put('/<int:room_id>')
@ensure_not_none('room')
@data_has('name')
def update_room(room_id):
    logger.info('processing update room request', {'room_id': room_id, 'room_data': g.data})
    room = g.room
    room.name = g.data['name']
    db: Database = g.db
    db.rooms.update(room)
    success_message = "Room updated"
    model_data = room.model_dump()
    logger.info(success_message, {"data": model_data})
    return jsonify({"message": success_message, "data": model_data}), 200


@rooms_bp.delete('/<int:room_id>')
@ensure_not_none('room')
def delete_room(room_id):
    logger.info('processing delete room request', {'room_id': room_id})
    db: Database = g.db
    db.rooms.delete(room_id)
    success_message = "Room deleted"
    logger.info(success_message)
    return jsonify({"message": success_message}), 200


@rooms_bp.put('/<int:room_id>/led_strips')
@data_has('red', optional=True)
@data_has('green', optional=True)
@data_has('blue', optional=True)
@data_has('brightness', optional=True)
@data_has('on', optional=True)
@ensure_not_none('room')
def update_led_strips(room_id):
    logger.info('processing update led strips request', {'room_id': room_id, 'data': g.data})
    room = g.room
    db: Database = g.db
    devices = db.led_strips.find_many_devices(room_id)
    for device in devices:
        led_strip = device.led_strip
        logger.debug("led strip before update", {"led_strip": led_strip.model_dump()})
        if led_strip is None:
            raise ValueError(f"Device {device.id} has no led strip")
        if g.data.get('red') is not None:
            led_strip.red = g.data['red']
        if g.data.get('green') is not None:
            led_strip.green = g.data['green']
        if g.data.get('blue') is not None:
            led_strip.blue = g.data['blue']
        if g.data.get('brightness') is not None:
            led_strip.brightness = g.data['brightness']
        if g.data.get('on') is not None:
            logger.debug('on is not none', {'on': g.data['on']})
            led_strip.on = g.data['on']
        logger.debug("led strip after update", {"led_strip": led_strip.model_dump()})
        db.led_strips.update(led_strip)
    success_message = "Led strips updated"
    logger.info(success_message)
    return jsonify({"data": g.data}), 200

