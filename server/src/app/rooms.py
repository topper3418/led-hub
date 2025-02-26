from flask import Blueprint, jsonify, g
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
@data_has('name')
def create_room():
    logger.info('processing create room request', {'room_data': g.data})
    try:
        room = Room(name=g.data['name'])
    except ValidationError as e:
        error_message = "Error parsing room data"
        logger.error(error_message, {"error": e.errors()})
        return jsonify({"error": error_message, "details": e.errors()}), 400
    db: Database = g.db
    db.rooms.create(room)
    success_message = "Room created"
    model_data = room.model_dump()
    logger.info(success_message, {"data": model_data})
    return jsonify({"message": success_message, "data": model_data}), 201


@rooms_bp.get('/<int:room_id>')
@ensure_not_none('room')
def get_room(room_id):
    logger.info('processing get room request', {'room_id': room_id})
    room = g.room
    room_data = room.model_dump()
    logger.debug('room data', {"data": room_data})
    return jsonify({"data": room_data})

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

