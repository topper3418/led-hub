from flask import jsonify, g

from src.db import Database
from src.models import LedStrip
from src.logging import get_logger

logger = get_logger(__name__)


def update_led_strip():
    led_strip: LedStrip = g.get('led_strip')
    logger.info('Updating led_strip', {'led_strip': led_strip.model_dump()})
    if g.color is not None:
        logger.debug(f"Setting color to {g.color}")
        led_strip.color = g.color
    if g.brightness is not None:
        logger.debug(f"Setting brightness to {g.brightness}")
        led_strip.brightness = g.brightness
    if g.on is not None:
        logger.debug(f"Setting on to {g.on}")
        led_strip.on = g.on
    db: Database = g.db
    db.led_strips.update(led_strip)
    return jsonify({"data": {"led_strip": led_strip.model_dump()}}), 204
    
