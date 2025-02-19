from flask import jsonify, g
from src.db import Database
from src.models import LedStrip


def update_led_strip():
    led_strip: LedStrip = g.get('led_strip')
    if g.color is not None:
        led_strip.color = g.color
    if g.brightness is not None:
        led_strip.brightness = g.brightness
    if g.on is not None:
        led_strip.on = g.on
    db: Database = g.db
    db.led_strips.update(led_strip)
    return jsonify({"data": {"led_strip": led_strip.model_dump()}}), 204
    
