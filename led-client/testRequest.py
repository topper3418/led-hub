from request import fetch_data
from networkConnection import NetworkConnection

from config import (SSID, 
                    PASSWORD,
                    SERVER_ENDPOINT)

from boardLed import BoardLed

boardLed = BoardLed()
connection = NetworkConnection(SSID, PASSWORD, pending=boardLed.toggle, complete=boardLed.turn_on)


# Test fetch_data function
if __name__ == "__main__":
    connection.connect()
    rel_url = "devices"
    data = fetch_data(rel_url)
    print(data)
