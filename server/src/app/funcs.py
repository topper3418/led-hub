from flask import jsonify, g
from pydantic import ValidationError

from src.db import Database
from src.models import LedStrip
from src.logging import get_logger

logger = get_logger(__name__)


def update_led_strip():
    led_strip: LedStrip = g.get('led_strip')
    logger.info('Updating led_strip', {'led_strip': led_strip.model_dump()})
    # if g.red is not None:
    #     logger.debug(f"Setting red to {g.red}")
    #     led_strip.red = g.red
    # if g.green is not None:
    #     logger.debug(f"Setting green to {g.green}")
    #     led_strip.green = g.green
    # if g.blue is not None:
    #     logger.debug(f"Setting blue to {g.blue}")
    #     led_strip.blue = g.blue
    # if g.brightness is not None:
    #     logger.debug(f"Setting brightness to {g.brightness}")
    #     led_strip.brightness = g.brightness
    # if g.on is not None:
    #     logger.debug(f"Setting on to {g.on}")
    #     led_strip.on = g.on
    try:
        led_strip_update = LedStrip(
            id=led_strip.id,
            device_id=led_strip.device_id,
            num_leds=led_strip.num_leds,
            led_pin=led_strip.led_pin,
            red=g.get('red', led_strip.red),
            green=g.get('green', led_strip.green),
            blue=g.get('blue', led_strip.blue),
            brightness=g.get('brightness', led_strip.brightness),
            on=g.get('on', led_strip.on)
        )
    except ValidationError as e:
        logger.error('Validation error', {'error': e.errors()})
        return jsonify({"error": e.errors()})
    db: Database = g.db
    db.led_strips.update(led_strip_update)
    return jsonify({"data": {"led_strip": led_strip.model_dump()}})
    
