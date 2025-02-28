from pprint import pprint

from src.db import Database
from src.dispatcher import test_prompt
from src.dispatcher.thoughtProcess import ThoughtProcess




def main():
    try:
        with Database() as db:
            devices = db.devices.find_many()
            for device in devices:
                device.room = db.rooms.find_by_id(device.room_id)
                device.led_strip = db.led_strips.find_by_device_id(device.id)
        thought_process = ThoughtProcess("Dim the kitchen", devices)
        thought_process.think()
        printable = {device_name: device.model_dump() for device_name, device in thought_process.device_dict.items()}
        pprint(printable)
    except ValueError as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    main()
