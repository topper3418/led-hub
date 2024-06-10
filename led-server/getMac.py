import network

def get_mac_address():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    mac = wlan.config('mac')
    # Convert the MAC address to a human-readable format
    mac_address = ':'.join('{:02x}'.format(b) for b in mac)
    return mac_address

if __name__ == '__main__':
    mac_address = get_mac_address()
    print(f'MAC Address: {mac_address}')