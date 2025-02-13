from machine import Pin
import neopixel
from config import LED_PIN


class Color:
    def __init__(self, color_data: dict):
        self.r = color_data.get('r', 0)
        self.g = color_data.get('g', 0)
        self.b = color_data.get('b', 0)


class LedStripState:
    def __init__(self, led_strip_data: dict):
        self.id = led_strip_data.get('id')
        self.on = led_strip_data.get('on', False)
        self.brightness = led_strip_data.get('brightness', 0)
        self.num_leds = led_strip_data.get('num_leds', 10)
        self.color = Color(led_strip_data)
        self.writer = neopixel.NeoPixel(Pin(LED_PIN), self.num_leds)

    def render(self):
        """returns a tuple to write to the led_strip pixels"""
        if not self.on:
            return (0,.0,0)
        multiplier = float(self.brightness)/255
        return (
            self.color.r * multiplier,
            self.color.g * multiplier,
            self.color.b * multiplier,
        )

    def __repr__(self):
        return f"<LedStrip r:{self.color.r}, g:{self.color.g}, b: {self.color.b}, brightness:{self.brightness}, [{'ON' if self.on else 'OFF'}]>"


class Device:
    def __init__(self, device_data: dict):
        self.id = device_data.get('id')
        self.port = device_data.get('port')
        self.ip = device_data.get('ip')
        self.name = device_data.get('name')
        self.led_strip = LedStripState(device_data.get('led_strip', {}))

    def write(self):
        color_data = self.led_strip.render()
        for led in list(range(self.led_strip.num_leds)):
            self.led_strip.writer[led] = color_data
        self.led_strip.writer.write()
    
    def __repr__(self):
        if self.name:
            return f"<Device {self.name}>"
        return f"<Device>"

