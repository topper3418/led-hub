from flask import Blueprint, request, jsonify, g
from pydantic import ValidationError

from src.clients import LedStripClient
from src.logging import get_logger
from src.db import Database
from src.models import Device

from .middleware import data_has, ensure_not_none


logger = get_logger(__name__)
led_strips_bp = Blueprint('led_strips', __name__)


@led_strips_bp.route('/', methods=['GET'])
def get_led_strips():
    logger.info('processing request to list led strips')
    room_id = request.args.get('room_id')
    with Database() as db:
        devices = db.led_strips.find_many_devices(None if not room_id else int(room_id))
    device_data = [device.model_dump() for device in devices or []]
    return jsonify({"data": {"led_strips": device_data}})


@led_strips_bp.route('/<int:device_id>', methods=['PUT'])
@data_has('color')
@data_has('brightness')
@data_has('on')
def write_to_device()
