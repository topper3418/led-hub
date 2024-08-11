from machine import Pin
import neopixel


class LedStrip:

    def __init__(self, pin, num_leds):
        self.strip = neopixel.NeoPixel(Pin(pin), num_leds)
        self.leds = list(range(num_leds))
        self.brightness = 255
        self.on = False
        self.color = {
            'r': 255, 
            'g': 255, 
            'b': 255
        }
        self.write()
    
    def setColor(self, newColor: dict):
        """color is expected to have the shape {r: int, g: int, b: int}"""
        self.color = newColor
        self.write()

    def setBrightness(self, brightness):
        self.brightness = brightness
        self.write()
    
    def write(self):
        if self.on:
            for led in self.leds:
                newValue = tuple(int(self.color[ii] * self.brightness/255) for ii in ['r', 'g', 'b'])
                self.strip[led] = newValue
        else:
            for led in self.leds:
                self.strip[led] = (0, 0, 0)
        self.strip.write()
    
    def turnOff(self):
        self.on = False
        self.write()
    
    def turnOn(self):
        self.on = True
        self.write()
    
    def getState(self):
        return {
            'color': self.color,
            'brightness': self.brightness,
            'on': self.on
        }
   
