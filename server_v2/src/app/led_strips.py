from flask import Blueprint, abort, request, jsonify, g
from pydantic import ValidationError

from src.clients import LedStripClient
from src.logging import get_logger
from src.db import Database
from src.models import Color, Device, LedStripState

from .middleware import data_has, ensure_not_none, load_led_strip


logger = get_logger(__name__)
led_strips_bp = Blueprint('led_strips', __name__)


led_strips_bp.before_request(load_led_strip)


@led_strips_bp.route('/', methods=['GET'])
def get_led_strips():
    logger.debug('processing request to list led strips')
    room_id = request.args.get('room_id')
    with Database() as db:
        devices = db.led_strips.find_many_devices(None if not room_id else int(room_id))
    device_data = [device.model_dump() for device in devices or []]
    logger.info('returning led-strip data to requestor', {"led_strips": device_data})
    return jsonify({"data": {"led_strips": device_data}})


@led_strips_bp.route('/<int:led_strip_id>', methods=['PUT'])
@data_has('color')
@data_has('brightness')
@data_has('on')
def write_to_device(led_strip_id):
    logger.debug('processing request to write to device', {"data": g.data})
    led_strip: LedStripState = g.led_strip
    if led_strip is None:
        abort(404,f'no led_strip found matching id={led_strip_id}')
    if g.color is not None:
        led_strip.color = Color(**g.color)
    if g.brightness is not None:
        led_strip.brightness = g.brightness
    if g.on is not None:
        led_strip.on = g.on
    with Database() as db:
        db.led_strips.update(led_strip)
    logger.info('updated led_strip', {"led_strip": led_strip.model_dump()})
    return jsonify({"data": led_strip.model_dump()}), 200


@led_strips_bp.route('/<int:led_strip_id>', methods=['GET'])
def get_led_strip(led_strip_id):
    logger.debug('processing request to get led_strip', {"led_strip_id": led_strip_id})
    led_strip: LedStripState = g.led_strip
    if led_strip is None:
        abort(404, f'no led_strip found matching id={led_strip_id}')
    logger.info('returning led_strip data to requestor', {"led_strip": led_strip.model_dump()})
    return jsonify({"data": led_strip.model_dump()}), 200
