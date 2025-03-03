import json
from typing import List, Optional

import pydantic

from src.db import Database
from src.dispatcher.client import GrokChatClient


class LedStripCommand(pydantic.BaseModel):
    on: Optional[bool]
    brightness: Optional[int]
    red: Optional[int]
    green: Optional[int]
    blue: Optional[int]

    @property
    def color(self) -> Optional[tuple[int, int, int]]:
        if self.red is not None and self.green is not None and self.blue is not None:
            return self.red, self.green, self.blue
        return None


class LedCommandResponse(pydantic.BaseModel):
    device_id: int
    command: LedStripCommand
    reason: str


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
object representing the current state of all devices. Your outpur should 
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
     include the current state of the kitchen lights in your response
 - with each response, include a reason for the command you are sending. Be 
   concise but complete
   - For example: if I ask you to dim the lights in the kitchen, you might 
     say "dimming the lights in the kitchen to 50% brightness"

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


