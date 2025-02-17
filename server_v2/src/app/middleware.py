from functools import wraps
from flask import g, jsonify, request

from src.db import Database
from src.logging import get_logger


logger = get_logger(__name__)

# init func
def get_db():
    g.db = Database()
    g.db.open_connection()


# teardown func
def close_db(exception):
    if hasattr(g, 'db'):
        g.db.close_connection()
    if exception:
        logger.error('received exception at teardown', {"exception", exception})


# route-specific middleware

def ensure_not_none(item_name):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            item = g.get(item_name)
            if item is None:
                error_message = f"'{item_name}' not found."
                logger.error(error_message)
                return jsonify({"error": error_message}), 404
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def data_has(item_name, optional = False):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = g.get('data')
            if data is None:
                body = request.json or {}
                data  = body.get('data', {})
            item = data.get(item_name)
            if item is None and not optional:
                error_message = f"{item_name} is missing from data"
                logger.error(error_message)
                return jsonify({"error": error_message}), 401
            setattr(g, item_name, item)
            return f(*args, **kwargs)
        return decorated_function
    return decorator


# blueprint middleware

def load_device():
    logger.debug('loading device')
    # early returns
    if request.view_args is None:
        return 
    # Extract device_id from the URL if present
    device_id = request.view_args.get('device_id')
    if device_id is None:
        return 
    # Load the device from the database
    db: Database = g.db
    device = db.devices.find_by_id(device_id)
    # Store the device in the global context
    g.device = device


def load_led_strip():
    # early returns
    if request.view_args is None:
        return 
    # Extract device_id from the URL if present
    led_strip_id = request.view_args.get('led_strip_id')
    if led_strip_id is None:
        return 
    # Load the device from the database
    with Database() as db:
        led_strip = db.led_strips.find_by_id(led_strip_id)
    # Store the device in the global context
    g.led_strip = led_strip
