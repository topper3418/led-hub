import json
from typing import List, Optional

import pydantic

from src.db import Database
from src.dispatcher.client import GrokChatClient
from src.logging import get_logger

logger = get_logger(__name__)


class LedCommandResponse(pydantic.BaseModel):
    device_id: int
    set_brightness: Optional[int] = None
    set_color: Optional[tuple[int, int, int]] = None
    set_on: Optional[bool] = None
    errors: list[str]


class CommandResponseList(pydantic.BaseModel):
    commands: list[LedCommandResponse]
    errors: list[str]


def get_full_led_strip_context(db: Database):
    devices = db.led_strips.find_many_devices()
    rooms = db.rooms.find_many()
    room_dict = {str(room.id): room for room in rooms}
    for device in devices:
        device.room = room_dict[str(device.room_id)]
    return [device.model_dump() for device in devices]


def get_full_led_strip_context_independent():
    with Database() as db:
        return get_full_led_strip_context(db)


response_schema_template = """
You are an IOT hub in charge of managing LED strips. You will receive a JSON 
object representing the current state of all devices. Your output should 
conform to the following json schema:

{response_schema}

a few notes: 
 - do NOT include commands for LED strips that the user did not ask for you 
   to manipulate
   - For example: if I ask you to dim the lights in the kitchen, do not 
   include any lights in the bedroom in your response
 - do NOT include data in your response for components of device state 
   that the use did not ask for you to manipulate. 
   - For example: if I ask you to dim the lights in the kitchen, do not 
     include the current state (on or off) of the kitchen lights in your response
   - The model I am using to parse your response has default values for the state, 
     so you need not even include them in your response if not being changed.
   - just to clarify, if the color is being changed, include all three components
     of the color (red, gren, blue) in the response
 - if you encounter an error, add a string to the errors list in the response
 - unless otherwise specified, always assume the user intends for the lights to 
   end up on when they ask to set brightness or color
 - if the user asks for a vague variety of colors, make each light a unique color
   - for example, if the user asks for a bunch of different hues of blue, make each
     light a different hue of blue, do not duplicate the rgb value at all in the 
     response.
   - of course, if the user is specific about colors they may want to make them 
     consistent. Do your best.

special commands:
 - lumos: turn on all lights in the living room and kitchen if not on already. if on
   already, increase the brightness of all the lights by 75 (capped at 255 of course)
 - lumos maxima: turn on all lights in the living room and kitchen and set brightness
   to 255
 - nox: turn off all lights in the living room and kitchen if not off already
 - migraine mode: turn on all lights to 50 brightness and set them to red

Here is the context in which the user's command should be interpreted

{context}

Now prepare yourself for the command
"""


class ContextCommandProcessor:
    def __init__(self, context: Optional[List[dict]] = None):
        self.client = GrokChatClient()
        self.response_str = ""
        self.response_schema = CommandResponseList.model_json_schema()
        self.context = context or get_full_led_strip_context_independent()
        self.client.history.append({
            "role": "system",
            "content": response_schema_template.format(
                response_schema=self.response_schema,
                context=json.dumps(self.context, indent=2)
            )
        })
        self.command: str = ""
        self.response: CommandResponseList | None = None

    def process_command(self, command: str) -> CommandResponseList:
        logger.info('processing command', {'command': command, 'context': self.context})
        self.command = command
        retries = 3
        while retries > 0:
            try:
                self.response_str = response_str = self.client.chat(content=command)
                print('response from chat:\n', response_str)
                self.client.history.append({
                    "role": "assistant",
                    "content": response_str
                })
                response_obj = json.loads(response_str)
                self.response = CommandResponseList(**response_obj)
                logger.info('processed command', {'response': self.response_str, 'command': command})
                return self.response
            except pydantic.ValidationError as e:
                retries -= 1
                print('encountered errors, trying to correct:', e.errors())
                self.client.history.append({
                    "role": "system",
                    "content": f"Error, please try to correct:\n{e.errors()}"
                })
                self.response = None
        raise Exception('Max retries exceeded')


