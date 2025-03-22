from enum import Enum
import os
from typing import List
import pydantic

from openai import OpenAI

from src.models import LedStrip
from src.db import Database


class Role(Enum):
    SYSTEM = 'system'
    ASSISTANT = 'assistant'
    USER = 'user'


class BaseModelWithEnum(pydantic.BaseModel):
    def model_dump(self, *args, **kwargs):
        data = super().model_dump(*args, **kwargs)
        for key, value in data.items():
            if isinstance(value, Enum):
                data[key] = value.value
        return data


class Message(BaseModelWithEnum):
    role: Role
    content: str


class Command(pydantic.BaseModel):
    device_name: str
    device_id: int
    excluded: bool = False
    command: LedStrip


class CommandResponse(pydantic.BaseModel):
    commands: List[Command]
    errors: List[str]


INIT_MESSAGE = Message(
    role=Role.SYSTEM,
    content="""
You are an AI assistant that controls smart LED strips in a home. You will receive a JSON object containing the current state of the rooms, devices, and LED strips, followed by the user's natural language command. The state has the following structure:

{
  "rooms": [
    {
      "id": int,
      "name": str,
      "devices": [
        {
          "id": int,
          "name": str or null,
          "mac": str,
          "room_id": int or null,
          "led_strip": {
            "id": int or null,
            "device_id": int,
            "on": bool,
            "brightness": int (0-255),
            "red": int (0-255),
            "green": int (0-255),
            "blue": int (0-255),
            "num_leds": int,
            "led_pin": int
          }
        }
      ]
    }
  ],
  "command": str
}

Your task is to interpret the user's command and output a JSON array of updates to be applied to the LED strips. Each update should be an object specifying:
- "device": str (the device name if available, otherwise the mac address),
- and the properties to change: "on": bool, "color": {"r": int, "g": int, "b": int}, "brightness": int.

### Guidelines:
1. **Identify Targets**: The user may refer to devices by their name (e.g., "kitchen light") or to all devices in a room (e.g., "all lights in the kitchen"). Use the device’s "name" field if provided; otherwise, use "mac".
2. **Parse Actions**: Recognize actions like "turn on/off", "set color" (e.g., "red"), or "dim" (adjust brightness).
3. **Color Mapping**: Map common color names to RGB values:
   - red = (255, 0, 0)
   - green = (0, 255, 0)
   - blue = (0, 0, 255)
   - white = (255, 255, 255)
   - black = (0, 0, 0)
   - etc.
4. **Brightness**: Interpret "dim" as reducing brightness to 100 (from a max of 255), unless a specific value or percentage is provided.
5. **Multiple Actions**: Handle commands with multiple actions (e.g., setting colors for different lights) by generating an update for each.
6. **Error Handling**: If a device or room in the command doesn’t exist, include an error message like {"error": "No device named 'foo' found"}.

### Output Format:
Return a JSON array of update objects. For example:
- For "Turn the kitchen light red":
  [
    {"device": "kitchen light", "color": {"r": 255, "g": 0, "b": 0}}
  ]
- For "Dim all lights in the kitchen":
  [
    {"device": "kitchen light", "brightness": 100},
    {"device": "bar light", "brightness": 100}
  ]

Your response must be a valid JSON array.
"""
)

def get_client():
    api_key = os.getenv("XAI_API_KEY")
    if not api_key:
        raise ValueError("Missing API key")
    return OpenAI(
        api_key=api_key,
        base_url="https://api.x.ai/v1"
    )

def get_messages(db: Database, command: str) -> List[Message]:
    rooms = db.rooms.find_many()
    for room in rooms:
        devices = db.led_strips.find_many_devices(room_id=room.id)
        room.devices = devices
    return [
        INIT_MESSAGE, 
        Message(
            role=Role.USER,
            content= f"""
This is the context for my command. You should use this information to interpret the user's request. 
    {[room.model_dump() for room in rooms]}


my command is: {command}
            """
        ),
    ]

def get_new_states(db: Database, command: str) -> List[Command]:
    model = os.getenv("XAI_MODEL") 
    attempts = 3
    messages = get_messages(db, command)
    messages = [message.model_dump() for message in messages]
    client = get_client()
    while attempts >= 0:
        try:
            response = client.chat.completions.create(
                model=model or 'grok-2-latest',
                messages=messages,
                temperature=0,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "CommandResponse",
                        "schema": CommandResponse.model_json_schema()
                    }
                }
            )
            return response.choices[0].message
        except Exception as e:
            attempts -= 1
            print(f"Error: {e}")


def test_prompt(db: Database) -> List[Command]:
    model = os.getenv("XAI_MODEL") 
    attempts = 3
    client = get_client()
    rooms = db.rooms.find_many()
    for room in rooms:
        devices = db.led_strips.find_many_devices(room_id=room.id)
        room.devices = devices
    while attempts >= 0:
        try:
            response = client.chat.completions.create(
                model=model or 'grok-2',
                messages=[
                    {
                        "role": "system",
                        "content": "The user will present to you a json schema describing the current state of a bunch of lights in an IOT hub. Please describe the state of the lights in a sentence or two to the user."
                    },
                    {
                        "role": "user",
                        "content": f"{[room.model_dump() for room in rooms]}"
                    }
                ],
                temperature=0,
            )
            return response.choices[0].message
        except Exception as e:
            attempts -= 1
            print(f"Error: {e}")

