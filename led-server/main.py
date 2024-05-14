from machine import ADC, Pin
from time import sleep
import neopixel
import network
import socket
import _thread

# config variables
debugKnob = False


# networking variables
ssid = 'the way of the wamel'
password = 'Maisie129'
led = Pin('LED', Pin.OUT)
last_command = '/lightoff?'


# board LED api
class BoardLed:
    
    def __init__(self):
        self.pin = Pin('LED', Pin.OUT)
        self.on = False
        self.pin.value(self.on)
    
    def toggle(self):
        newStatus = not self.on
        self.pin.value(newStatus)
        self.on = newStatus
    
    def turnOn(self):
        self.on = True
        self.pin.value(1)
    
    def turnOff(self):
        self.on = False
        self.pin.value(0)


class LedStrip:

    def __init__(self, pin, num_leds):
        self.strip = neopixel.NeoPixel(Pin(pin), num_leds)
        self.leds = list(range(num_leds))
        self.brightness = 255
        self.on = False
        self.color = (255, 255, 255)
        self.write()
    
    def setColor(self, color):
        self.color = color
        self.write()

    def setBrightness(self, brightness):
        self.brightness = brightness
        self.write()
    
    def write(self):
        if self.on:
            for led in self.leds:
                newValue = tuple(int(rgbval * self.brightness/255) for rgbval in self.color)
                print(f'setting led to {newValue}')
                self.strip[led] = newValue
        else:
            for led in self.leds:
                self.strip[led] = (0, 0, 0)
    
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


class BrightnessKnob:

    def __init__(self, pin, debug=False):
        self.pin = ADC(Pin(pin))
        self.minimum = 30000
        self.maximum = 65535
        self.value = 0
        self.changed = False
        self.debug = debug
    
    def read(self):
        value = self.pin.read_u16()
        previous = self.value
        
        if value <= self.minimum:
            newValue = 0
        elif value >= self.maximum:
            newValue = 255
        else:
            shifted_max = self.maximum - self.minimum
            shifted_value = value - self.minimum
            percentage = shifted_value/shifted_max
            newValue = int(255 * percentage)
        
        # to filter out noise, change of 5 needed
        if abs(newValue-self.value) < 10:

            return self.value
        if self.debug:
            print(f'setting new knob value {newValue}')
        self.value = newValue
        self.changed = True
        return self.value
    

# gpio objects
knob = BrightnessKnob('GP28', debug=False)
ledStrip = LedStrip('GP4', 8)
boardLed = BoardLed()



def connect():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)
    while wlan.isconnected() == False:
        print('Waiting for connection...')
        boardLed.toggle()
        sleep(1)
    ip = wlan.ifconfig()[0]
    print(f'Connected on {ip}')
    boardLed.turnOn()
    return ip


def open_socket(ip):
    address = (ip, 80)
    connection = socket.socket()
    connection.bind(address)
    connection.listen(1)
    return connection
            

sLock = _thread.allocate_lock()
        

def serve():
    """serves the connection for the webpage"""
    ip = connect()
    connection = open_socket(ip)
    state = ''
    while True:
        # get connection/request
        client = connection.accept()[0]
        request = client.recv(1024)
        request = str(request)
        print(request)
        sLock.acquire()

        # get command
        try:
            path = request.split(' ')[1]
            cmd, params = request.split('?') if '?' in path else (path, '')
            print(f'cmd: {cmd}, params: {params}')
            param = params.split('&')[0] if params else ''
        except (IndexError, ValueError):
            cmd = ''
            param = ''
        if cmd == '/lighton':
            ledStrip.turnOn()
        elif cmd == '/lightoff':
            ledStrip.turnOff()
        elif cmd == '/brightness':
            try:
                brightness = int(param.split('=')[1])
                ledStrip.setBrightness(brightness)
            except (IndexError, ValueError):
                client.send('Invalid brightness')
                return
        elif cmd == '/color':
            try:
                r, g, b = param.split('=')[1].split(',')
                ledStrip.setColor((int(r), int(g), int(b)))
            except (IndexError, ValueError):
                client.send('Invalid color')
                return
        sLock.release()
        #client.send(ledStrip.getState())
        client.close()


def run_gpio():
    while True:
        sLock.acquire()
        brightness = knob.read()
        if knob.changed:
            ledStrip.setBrightness(brightness)
            knob.changed = False
        ledStrip.write()
        sLock.release()


try:
    _thread.start_new_thread(run_gpio, ())
    serve()
except KeyboardInterrupt:
    machine.reset()

