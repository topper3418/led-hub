# module imports
import machine
import time
import requests

# custom module imports
from networkConnection import NetworkConnection
from boardLed import BoardLed
from handshake import handshake
from models import Device, LedStripState

from config import (SSID, 
                    PASSWORD,
                    SERVER_ENDPOINT)


# gpio 
boardLed = BoardLed()
# network
connection = NetworkConnection(SSID, PASSWORD, pending=boardLed.toggle, complete=boardLed.turn_on)



def do_handshake() -> Device:
    handshake_endpoint = SERVER_ENDPOINT + 'devices/'
    while not (device := handshake(connection, handshake_endpoint)):
        time.sleep(1)
        boardLed.toggle()
    if not isinstance(device, Device):
        raise Exception('something went wrong and no device was returned. Aborting.')
    boardLed.turn_on()
    return device


def get_update(device: Device):
    boardLed.turn_on()
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
        new_state = LedStripState(data)
        print("got update from server:\n", new_state)
        device.led_strip = new_state
    except Exception as e:
        print('an exception was raised while trying to parse response')
        return
    # use that object's data to write to the led strip
    try:
        device.write()
    except Exception as e:
        print('an exception was raised while trying to write to device')
    boardLed.turn_off()


if __name__ == '__main__':
    try:
        # connect to network
        connection.connect()
        # first do a handshake with the server to register the device
        device = do_handshake()
        # Then just keep getting updates
        while True:
            get_update(device)
            time.sleep(.25)
    except KeyboardInterrupt:
        machine.reset()

