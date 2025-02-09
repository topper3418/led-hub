# an object that stores the necessary strings and objects to turn a plain english request into action


# quick brainstorm: 

# First the plain string comes in to the route
# then we ask the model which of the options for actions it seems like we would most likely satisfy the command
# then we ask the model to fill out the schema for the command
# then we run the verification script to make sure the command is valid
# if not, we ask it to correct it once
# then we run the command
import json
from pprint import pprint
from typing import Dict, List
import ollama
from pydantic import BaseModel, create_model

from .models import Color, Device, DeviceCommand, LedState, ProcessedVoiceCommand
from .integratedClient import IntegratedClient
from .logging import getLogger

logger = getLogger(__name__)


class CommandContents(BaseModel):
    on_or_off: bool
    brightness: bool
    color: bool


class ThoughtProcess:
    def __init__(self, command: str, mock_devices: List[dict] | None = None):
        self.command = command
        self.command_contents: CommandContents | None = None
        self.client = IntegratedClient()
        self.all_devices: Dict[str, Device] | None = None
        self.mock_devices = mock_devices
        self.context_object: Dict[str, dict] | None = None
        self.relevant_devices: List[str] | None = None
        self.device_commands: Dict[str, Device] | None = None

    def think(self) -> ProcessedVoiceCommand:
        logger.debug(f'processing command "{self.command}"')
        self.command_contents = self.get_command_contents()
        logger.debug('command contents assessed', self.command_contents.model_dump())
        if self.mock_devices is not None:
            self.all_devices = {device.get('name', 'unknown_device'): Device(**device) for device in self.mock_devices}
            logmsg = 'using mock devices'
        else:
            self.all_devices = {device.name: device for device in self.client.read_all()}
            logmsg = 'devices read'
        logger.debug(logmsg, {name: device.model_dump() for name, device in self.all_devices.items()})
        self.context_object = self.get_context_object()
        logger.debug('context object', self.context_object)
        self.relevant_devices = self.get_relevant_devices()
        logger.debug('relevant devices', self.relevant_devices)
        self.device_commands = {device: self.get_device_commands(device) for device in self.relevant_devices}
        logger.debug('commands', {device_name: command.model_dump() for device_name, command in self.device_commands.items()})
        return ProcessedVoiceCommand(
            device_commands=self.device_commands,
            voice_command=self.command
        )
    
    # this function takes in a command and decides what it is doing to the lights, 
    # whether it is turning them on or off, changing the brightness, or changing the color
    def get_command_contents(self) -> CommandContents: 
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
        for device in self.all_devices.values():
            if not device.connected:
                continue
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
        fields = { name: (bool, ...) for name in self.all_devices.keys() }
        DevicesRelevance = create_model('DevicesRelevance', **fields)
        response = ollama.chat(
            messages=[
                {
                    "role": "system",
                    "content": f"the user will give you a command to process. your job is to determine which devices are relevant to the command. you will respond by marking the irrelevant devices as false and the relevant devices as true. bias toward marking devices not relevant unless they seem to be called out directly."
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
        for device in self.all_devices.keys():
            if relevancy.get(device):
                relevant_devices.append(device)
        return relevant_devices

    def get_device_commands(self, device_name: str) -> Device:
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
            fields['color'] = (Color, ...)
        DeviceCommands = create_model('DeviceCommands', **fields)
        # get the relevant device from the context object
        device_for_context = self.context_object[device_name]
        response = ollama.chat(
            messages=[
                {
                    "role": "system",
                    "content": f"""the user will give you a command to process. your job is to tweak the settings of the device to match the user's command. this is the current state of the device: 
                    {device_for_context}

                    your job is to give the new state of the device based on the command."""
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
        logger.debug('raw commands', commands)
        commands = json.loads(commands or "{}")
        # merge the commands with the current state of the device
        if device_name not in self.all_devices:
            raise ValueError(f'{device_name} must be in all_devices before calling get_commands')
        device_data = self.all_devices[device_name].model_dump()
        logger.debug('raw device data before merge', device_data)
        new_state = {**device_data, **commands}
        logger.debug('raw device data after merge', new_state)
        return Device(**new_state)





