from flask import Blueprint, request, jsonify, g

from src.logging import get_logger
from src.db import Database
from src.models import LedStripState

from .funcs import update_led_strip

from .middleware import data_has, load_led_strip


logger = get_logger(__name__)
led_strips_bp = Blueprint('led_strips', __name__)


led_strips_bp.before_request(load_led_strip)


@led_strips_bp.get('/')
def get_led_strips():
    logger.info('processing request to list led strips')
    room_id = request.args.get('room_id')
    with Database() as db:
        devices = db.led_strips.find_many_devices(None if not room_id else int(room_id))
    device_data = [device.model_dump() for device in devices or []]
    return jsonify({"data": {"led_strips": device_data}})


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
    led_strip: LedStripState = g.get('led_strip')
    return jsonify({"data": led_strip.model_dump()})
