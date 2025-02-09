from pprint import pprint
from src.dispatcher import ThoughtProcess
from src.logging import getLogger

logger = getLogger(__name__)
test_context = [
  {
    "name": "fireplace",
    "mac": "28:cd:c1:11:96:f5",
    "on": False,
    "brightness": 255,
    "color": { "r": 255, "g": 255, "b": 255 },
    "connected": False
  },
  {
    "name": "kitchen",
    "mac": "00:11:22:33:44:55",
    "on": True,
    "brightness": 200,
    "color": { "r": 128, "g": 200, "b": 150 },
    "connected": True
  },
  {
    "name": "couch",
    "mac": "66:77:88:99:aa:bb",
    "on": False,
    "brightness": 100,
    "color": { "r": 255, "g": 100, "b": 0 },
    "connected": True
  },
  {
    "name": "bar",
    "mac": "cc:dd:ee:ff:00:11",
    "on": True,
    "brightness": 0,
    "color": { "r": 0, "g": 0, "b": 0 },
    "connected": True
  },
  {
    "name": "hallway",
    "mac": "11:22:33:44:55:66",
    "on": True,
    "brightness": 128,
    "color": { "r": 10, "g": 20, "b": 30 },
    "connected": True
  },
  {
    "name": "bed",
    "mac": "77:88:99:aa:bb:cc",
    "on": True,
    "brightness": 75,
    "color": { "r": 75, "g": 150, "b": 225 },
    "connected": True
  },
]

def do_command_test(command: str):
    processed_command = ThoughtProcess(command, test_context).think()
    pprint(processed_command.model_dump())

if __name__ == "__main__":
    do_command_test("turn off the kitchen light")
    do_command_test("dim the couch light")
    do_command_test("make the fireplace light red")
    do_command_test("set all lights to a dim red")
    do_command_test("turn on the bar light")
    do_command_test("turn off all lights")
    do_command_test("turn off the lights")
    do_command_test("turn off everything except the bar and kitchen lights")
