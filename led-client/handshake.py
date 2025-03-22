# handshake.py
from request import fetch_data
from getMac import get_mac_address
from models import Device

def handshake(connection, relative_endpoint) -> bool | Device:
    """Sends a request to the server to register the device"""
    
    mac = get_mac_address()
    print(f'got mac: {mac}')
    
    handshake_data = {
        'mac': mac,
        'type': 'LedStrip',
        'ip': connection.ip,
    }
    
    try:
        print(f'attempting handshake with at "{relative_endpoint}"')
        res_json = fetch_data(relative_endpoint, method="POST", data={"data": handshake_data})
        
        if res_json is None:
            print('handshake failed')
            return False
        
        data = res_json.get('data')
        if error := res_json.get('error'):
            print(f'received error: {error}')
            return False
        
        device = Device(data)
        print(f'received response:\n', res_json)
        device.write()
        return device
    
    except Exception as e:
        print('error during handshake:', e)
        return False
