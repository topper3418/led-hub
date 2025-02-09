# an object that stores the necessary strings and objects to turn a plain english request into action


# quick brainstorm: 

# First the plain string comes in to the route
# then we ask the model which of the options for actions it seems like we would most likely satisfy the command
# then we ask the model to fill out the schema for the command
# then we run the verification script to make sure the command is valid
# if not, we ask it to correct it once
# then we run the command
from enum import Enum
import json
from typing import Dict, List
import ollama
from pydantic import BaseModel, create_model
from pprint import pprint

from .models import Color, Device, LedState
from .integratedClient import IntegratedClient
from .logging import getLogger

logger = getLogger(__name__)

# move these downward
# enum for the different types of commands


class CommandContents(BaseModel):
    on_or_off: bool
    brightness: bool
    color: bool


class ThoughtProcess:
    def __init__(self, command: str, mock_devices: List[dict] | None = None):
        self.command = command
        self.command_contents: CommandContents | None = None
        self.client = IntegratedClient()
        self.all_devices: List[Device] | None = None
        self.mock_devices = mock_devices
        self.context_object: Dict[str, dict] | None = None
        self.relevant_devices: List[str] | None = None
        self.commands: List[LedState] | None = None

    def think(self):
        logger.debugp(f'processing command "{self.command}"')
        self.command_contents = self.get_command_contents()
        logger.debugp('command contents assessed', self.command_contents.model_dump())
        if self.mock_devices is not None:
            logger.debugp('using mock devices')
            self.all_devices = [Device(**device) for device in self.mock_devices]
        else:
            self.all_devices = self.client.read_all()
            logger.debugp('devices read', [device.model_dump() for device in self.all_devices])
        self.context_object = self.get_context_object()
        logger.debugp('context object', self.context_object)
        self.relevant_devices = self.get_relevant_devices()
        logger.debugp('relevant devices', self.relevant_devices)
        self.commands = [self.get_commands(device) for device in self.relevant_devices]
        logger.debugp('commands', [command.model_dump() for command in self.commands])
    
    # this function takes in a command and decides what it is doing to the lights, 
    # whether it is turning them on or off, changing the brightness, or changing the color
    def get_command_contents(self) -> CommandContents: 
        logger.debug(f'processing command "{self.command}"')
        response = ollama.chat(
            messages=[
                {
                    "role": "system",
                    "content": f"the user will give you a command to process. your job is to determine which features of the command are present. the features are: on/off, brightness, and color. you will need to determine which of these features are present in the command."
                },
                {
                    "role": "user",
                    "content": f"command: {self.command}"
                }
            ],
            model='llama3.2',
            format=CommandContents.model_json_schema()
        )
        assessment = response.message.content
        assessment = json.loads(assessment or "{}")
        return CommandContents(**assessment)

    # this function gets the lights and shows the relevant values for the lights,
    # based on the assessment of the passed CommandContents object
    def get_context_object(self) -> Dict[str, dict]:
        if self.command_contents is None:
            raise ValueError('assessment must be set before calling get_relevant_lights')
        if self.all_devices is None:
            raise ValueError('devices must be set before calling get_relevant_lights')
        # construct an object like 
        # [
        #     {
        #         "<device name>": {
        #             "on": <on value>, -- if relevant
        #             "brightness": <brightness value>, -- if relevant
        #             "color": <color value> -- if relevant
        #         }
        #     }
        # ]
        context_struct = {}
        for device in self.all_devices:
            temp_dict = {}
            if self.command_contents.on_or_off:
                temp_dict['on'] = device.on
            if self.command_contents.brightness:
                temp_dict['brightness'] = device.brightness
            if self.command_contents.color:
                temp_dict['color'] = device.color
            context_struct[device.name] = temp_dict
        return context_struct


    def get_relevant_devices(self) -> List[str]:
        if self.context_object is None:
            raise ValueError('context_object must be set before calling get_relevant_devices')
        if self.all_devices is None:
            raise ValueError('devices must be set before calling get_relevant_devices')
        class DevicesRelevance(BaseModel):
            pass
        # loop through the devices to add to the devicesRelevance class,
        # which will be used to force the output from the model
        fields = { name: (bool, ...) for name in [device.name for device in self.all_devices] }
        DevicesRelevance = create_model('DevicesRelevance', **fields)
        response = ollama.chat(
            messages=[
                {
                    "role": "system",
                    "content": f"the user will give you a command to process. your job is to determine which devices are relevant to the command. you will respond by marking the irrelevant devices as false and the relevant devices as true."
                },
                {
                    "role": "user",
                    "content": f"command: {self.command}"
                }
            ],
            model='llama3.2',
            format=DevicesRelevance.model_json_schema()
        )
        relevancy = response.message.content
        relevancy = json.loads(relevancy or "{}")
        relevant_devices = []
        for device in self.all_devices:
            if relevancy.get(device.name):
                relevant_devices.append(device.name)
        return relevant_devices

    def get_commands(self, device_name: str) -> LedState:
        if self.context_object is None:
            raise ValueError('context_object must be set before calling get_commands')
        if self.relevant_devices is None:
            raise ValueError('relevant_devices must be set before calling get_commands')
        if self.all_devices is None:
            raise ValueError('devices must be set before calling get_commands')
        if device_name not in self.relevant_devices:
            raise ValueError(f'{device_name} must be in relevant_devices before calling get_commands')
        if self.command_contents is None:
            raise ValueError('assessment must be set before calling get_commands')

        class DeviceCommands(BaseModel):
            pass
        # loop through the devices to add to the devicesRelevance class,
        # which will be used to force the output from the model
        # only allow for changes to the settings that the previous query allowed for
        fields = { }
        if self.command_contents.on_or_off:
            fields['on'] = (bool, ...)
        if self.command_contents.brightness:
            fields['brightness'] = (int, ...)
        if self.command_contents.color:
            fields['color'] = Color
        DeviceCommands = create_model('DeviceCommands', **fields)
        # get the relevant device from the context object
        print(self.context_object)
        device_for_context = self.context_object[device_name]
        response = ollama.chat(
            messages=[
                {
                    "role": "system",
                    "content": f"""the user will give you a command to process. your job is to tweak the settings of the device to match the user's command. this is the current state of the device: 
                    {device_for_context}""",
                },
                {
                    "role": "user",
                    "content": f"command: {self.command}"
                }
            ],
            model='llama3.2',
            format=DeviceCommands.model_json_schema()
        )
        commands = response.message.content
        commands = json.loads(commands or "{}")
        # merge the commands with the current state of the device
        device_data = [device for device in self.all_devices if device.name == device_name]
        if len(device_data) == 0:
            raise ValueError(f'could not find device with name {device_name}')
        device_data = device_data[0]
        new_state = {**device_data.LedState.model_dump(), **commands}
        pprint(new_state)
        return LedState(**new_state)





