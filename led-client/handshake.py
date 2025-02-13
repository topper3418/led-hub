import requests

from getMac import get_mac_address
from models import Device

def handshake(connection, server_endpoint) -> bool | Device:
    """sends a request to the server to register the device"""
    
    mac = get_mac_address()
    print(f'got mac: {mac}')
    
    headers = {
        "content-type": "application/json"
    }
    
    handshake_data = {
        'mac': mac,
        'type': 'LedStrip',
        'ip': connection.ip,
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
        device = Device(res_json.get('data'))
        print(f'received response:\n', res_json)
        device.write()
        return device
    except Exception as e:
        print('error during handshake:', e)
        return False
