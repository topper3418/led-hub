from flask import Blueprint, request, jsonify, g, abort
from pydantic import ValidationError

from src.logging import get_logger
from src.db import Database
from src.models import LedStrip

from .funcs import update_led_strip

from .middleware import data_has, load_led_strip


logger = get_logger(__name__)
led_strips_bp = Blueprint('led_strips', __name__)


led_strips_bp.before_request(load_led_strip)


@led_strips_bp.get('/')
def get_led_strips():
    logger.info('processing request to list led strips')
    room_id = request.args.get('room_id')
    db: Database = g.db
    try:
        devices = db.led_strips.find_many_devices(None if not room_id else int(room_id))
    except ValidationError as e:
        errors = e.errors()
        logger.error('Failed to get devices from db', {"errors": errors})
        abort(500, errors)
        return
    except Exception as e:
        error_message = "Failed to get devices from db"
        logger.error(error_message, {"error": str(e)})
        abort(500, error_message)
        return
    logger.debug(f'got {len(devices)} devices from db')
    device_data = [device.model_dump() for device in devices or []]
    payload = {"data": {"devices": device_data}}
    logger.debug('returning data for led strips', {"payload": payload})
    return jsonify(payload)


@led_strips_bp.put('/')
def update_many_led_strips():
    logger.info('processing request to update many led strips')
    # data will be many id'ed LED objects
    try: 
        body = request.json or {}
        data = body.get('data', {})
        led_strips = [LedStrip(**item) for item in data]
    except ValidationError as e:
        errors = e.errors()
        logger.error('Error parsing data for update many', {"errors": errors})
        return jsonify({"error": errors}), 401
    except Exception as e:
        error_message = "Invalid data payload"
        logger.error(error_message)
        return jsonify({"error": error_message}), 401
    db: Database = g.db
    for led_strip in led_strips:
        if led_strip.id is None:
            error_message = "no id provied for led_strip"
            dump = led_strip.model_dump()
            logger.error(error_message, {"led_strip": dump})
            return jsonify({"error": error_message, "led_strip": led_strip})
        db.led_strips.update(led_strip)
    return jsonify({"data": led_strips}), 201


@led_strips_bp.put('/<int:led_strip_id>')
@data_has('color', optional=True)
@data_has('brightness', optional=True)
@data_has('on', optional=True)
def update_led_strip_state(led_strip_id):
    logger.info(f'updating led strip state id {led_strip_id}', {"data", g.data})
    return update_led_strip()


@led_strips_bp.get('/<int:led_strip_id>')
def read_led_strip_state(led_strip_id):
    logger.debug(f'processing request to read led strip with id {led_strip_id}')
    led_strip: LedStrip = g.get('led_strip')
    return jsonify({"data": led_strip.model_dump()})
