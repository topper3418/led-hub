import time
import requests
import random

from src import config, models


SERVER_ENDPOINT = f'http://localhost:{config.APP_PORT}/'


def get_mac_address():
    mac = [0x02] + [random.randint(0x00, 0x7f) for _ in range(5)] + [random.randint(0x00, 0xff)]
    return ':'.join(format(x, '02x') for x in mac)


def generate_random_ip():
    return '.'.join(str(random.randint(0, 255)) for _ in range(4))


def handshake(server_endpoint) -> bool | models.Device:
    """sends a request to the server to register the device"""
    
    mac = get_mac_address()
    print(f'got mac: {mac}')
    
    headers = {
        "content-type": "application/json"
    }
    
    handshake_data = {
        'mac': mac,
        'type': 'LedStrip',
        'ip': generate_random_ip(),
    }
    
    try:
        print(f'attempting handshake with at "{server_endpoint}')
        res = requests.post(server_endpoint, json={"data": handshake_data}, headers=headers)
        if res.status_code == 200:
            print('handshake successful')
        else: 
            print('handshake failed')
            return False
        res_json = res.json()
        if error := res_json.get('error'):
            print(f'received error: {error}')
            return False
        device = models.Device(**res_json.get('data'))
        setattr(device, 'write', lambda: print('writing to device, but not really', device.model_dump()))
        print(f'received response:\n', res_json)
        device.write()
        return device
    except Exception as e:
        print('error during handshake:', e)
        return False


def do_handshake() -> models.Device:
    handshake_endpoint = SERVER_ENDPOINT + 'devices/'
    while not (device := handshake(handshake_endpoint)):
        time.sleep(1)
    if not isinstance(device, models.Device):
        raise Exception('something went wrong and no device was returned. Aborting.')
    return device


def get_update(device: models.Device):
    update_endpoint = SERVER_ENDPOINT + '/devices/' + str(device.id) + '/led_strip'
    # fetch data from server
    try:
        response = requests.get(update_endpoint)
        response_json = response.json()
        if (error := response_json.get('error')):
            print('error returned:', error)
            return
    except Exception as e:
        print('an exception was raised while trying to get update', e)
        return
    # load data into object
    try:
        data = response_json.get('data')
        new_state = models.LedStrip(**data)
        device.led_strip = new_state
    except Exception as e:
        print('an exception was raised while trying to parse response')
        return
    # use that object's data to write to the led strip
    try:
        device.write()
    except Exception as e:
        print('an exception was raise dwhile trying to write to device')


if __name__ == '__main__':
    # first do a handshake with the server to register the device
    device = do_handshake()
    # Then just keep getting updates
    while True:
        get_update(device)
        time.sleep(.25)

