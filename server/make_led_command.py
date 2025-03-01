import sys
import json
from pprint import pprint
from typing import Optional
import pydantic
from src.db import Database
from src.dispatcher.client import GrokChatClient
from src.models import Color, LedStrip

def make_led_command(command: str) -> LedStrip:
    client = GrokChatClient()
    system_prompt = f"""
You are an LED strip. I will send you a command to change your state. Your state must be represented by the following model: 
{LedStrip.model_json_schema()}
"""
    client.history.append({
        "role": "system",
        "content": system_prompt
    })
    completion = client.chat(
        content=command
    )
    response_string = completion.choices[0].message.content
    if response_string is None:
        raise ValueError("No response from the model.")
    response = json.loads(response_string)
    return LedStrip(**response)


class LedStripCommand(pydantic.BaseModel):
    on: Optional[bool]
    brightness: Optional[int]
    red: Optional[int]
    green: Optional[int]
    blue: Optional[int]


class LedCommandResponse(pydantic.BaseModel):
    deviceId: int
    command: LedStripCommand
    reason: str


class CommandResponseList(pydantic.BaseModel):
    commands: list[LedCommandResponse]
    errors: list[str]


def get_full_led_strip_context():
    with Database() as db:
        devices = db.led_strips.find_many_devices()
        rooms = db.rooms.find_many()
        room_dict = {str(room.id): room for room in rooms}
        for device in devices:
            device.room = room_dict[str(device.room_id)]
    return [device.model_dump() for device in devices]


class ContextCommandProcessor:
    def __init__(self):
        self.client = GrokChatClient()
        self.response_str = ""
        self.response_schema = CommandResponseList.model_json_schema()
        self.context = get_full_led_strip_context()
        self.client.history.append({
            "role": "system",
            "content": f"""
You are an IOT hub in charge of managing LED strips. You will receive a JSON 
object representing the current state of all devices. Your outpur should 
conform to the following json schema:
{self.response_schema}

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

{self.context}

Now prepare yourself for the command
            """
        })
        self.command: str = ""
        self.response: CommandResponseList = None

    def process_command(self, command: str) -> CommandResponseList:
        self.command = command
        self.response_str = response_str = self.client.chat(content=command)
        print('got response: \n', response_str)
        self.response = json.loads(response_str)
        return self.response


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python make_led_command.py \"command\"")
        sys.exit(1)
    command = sys.argv[1]
    processor = ContextCommandProcessor()
    pprint(processor.context)
    print("COMMAND:", command)
    command_response = processor.process_command(command)
    pprint(command_response)
    # print(response)
