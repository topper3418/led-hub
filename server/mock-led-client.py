import time
import requests
import random
from pprint import pprint
import argparse

from src import config, models


DEFAULT_SERVER_ENDPOINT = f'http://led-hub.local:8000/'

# Parse command-line arguments
parser = argparse.ArgumentParser(description="LED Strip Client")
parser.add_argument(
    "-s", "--server",
    default=DEFAULT_SERVER_ENDPOINT,
    help=f"Server endpoint (default: {DEFAULT_SERVER_ENDPOINT})"
)
args = parser.parse_args()
SERVER_ENDPOINT = args.server


def get_mac_address():
    mac = [0x02] + [random.randint(0x00, 0x7f) for _ in range(5)] + [random.randint(0x00, 0xff)]
    return ':'.join(format(x, '02x') for x in mac)


def generate_random_ip():
    return '.'.join(str(random.randint(0, 255)) for _ in range(4))


def fake_write(led_strip_inst):
    print('writing to device, but not really')
    pprint(led_strip_inst.model_dump())


def handshake(server_endpoint, mac, ip) -> bool | models.Device:
    """sends a request to the server to register the device"""
    headers = {
        "content-type": "application/json"
    }
    handshake_data = {
        'mac': mac,
        'type': 'LedStrip',
        'ip': ip,
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
        print(f'received response:\n', res_json)
        fake_write(device)
        return device
    except Exception as e:
        print('error during handshake:', e)
        return False


def do_handshake() -> models.Device:
    handshake_endpoint = SERVER_ENDPOINT + 'devices/'
    mac = get_mac_address()
    ip = generate_random_ip()
    retries = 0
    while not (device := handshake(handshake_endpoint, mac, ip)):
        if retries >= 10:
            raise Exception('Max retries exceeded')
        time.sleep(1)
        retries += 1
    if not isinstance(device, models.Device):
        raise Exception('something went wrong and no device was returned. Aborting.')
    return device


def get_update(device: models.Device):
    update_endpoint = SERVER_ENDPOINT + 'devices/' + str(device.id) + '/led_strip'
    # fetch data from server
    response = requests.get(update_endpoint)
    if not response.status_code == 200:
        print(f'received a status code of {response.status_code}')
    response_json = response.json()
    if (error := response_json.get('error')):
        print('error returned:', error)
        return
    # load data into object
    try:
        led_strip_data = response_json.get('data', {})
        if not led_strip_data:
            raise ValueError('no device data returned')
        print('got data: ', led_strip_data)
        led_strip = models.LedStrip(**led_strip_data)
        device.led_strip = led_strip
    except Exception as e:
        print('an exception was raised while trying to parse response', e)
        return
    # use that object's data to write to the led strip
    try:
        fake_write(led_strip)
    except Exception as e:
        print('an exception was raise dwhile trying to write to device')


def main():
    # first do a handshake with the server to register the device
    device = do_handshake()
    # Then just keep getting updates
    while True:
        get_update(device)
        time.sleep(.25)


if __name__ == '__main__':
    main()

