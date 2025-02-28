from flask import Blueprint, abort, request, jsonify, g
from pydantic import ValidationError

from src.dispatcher import get_new_states
from src.logging import get_logger
from src.db import Database
from src.models import Device, Room

from .middleware import data_has, ensure_not_none, load_device
from .funcs import update_led_strip


logger = get_logger(__name__)
command_bp = Blueprint('command', __name__)


@command_bp.route('/')
@data_has('command')
def process_voice_command():
    logger.debug('received command to process')
    command = g.get('command')
    # get the devices and their current state
    db: Database = g.db
    results = get_new_states(db, command)
    return jsonify(results)
    


