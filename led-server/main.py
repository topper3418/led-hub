# module imports
import machine
import configparser

# custom module imports
from ledStrip import LedStrip
from request import Request
from response import Response
from server import Server

# config variables
config = configparser.ConfigParser()
config.read('config.ini')



# networking variables
wlanConfig = config['WLAN']
ssid = wlanConfig['ssid']
password = wlanConfig['password']

static_ip = wlanConfig['static_ip']
subnet_mask = wlanConfig['subnet_mask']
gateway = wlanConfig['gateway']
dns_server = wlanConfig['dns_server']
static_ip_config = (static_ip, subnet_mask, gateway, dns_server)


# gpio objects
ledStrip = LedStrip(4, 30)
server = Server(ssid, password, static_ip_config)

def log_request(req: Request, _):
    print(req)
    
server.use(log_request)

@server.route('GET', '/')
def get_data(_, res: Response):
    """returns the state of the LED strip"""
    res.content = ledStrip.getState()


@server.route('POST', '/')
def set_strip(req: Request, res: Response):
    """depending on params, changes the state of the LED strip and returns 
    the state"""
    if 'brightness' in req.params:
        print('setting brightness')
        ledStrip.setBrightness(int(req.params['brightness']))
    if 'state' in req.params:
        if req.params['state'] == 'on':
            print('turning on')
            ledStrip.turnOn()
        else:
            print('turning off')
            ledStrip.turnOff()
    if 'color' in req.params:
        print('setting color')
        color_strs = req.params['color'].strip('()').split(',')
        color = tuple(int(color_val) for color_val in color_strs)
        ledStrip.setColor(color)   
    res.content = ledStrip.getState()

try:
    server.run()
except KeyboardInterrupt:
    machine.reset()

