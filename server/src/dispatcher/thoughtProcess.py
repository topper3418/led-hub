# an object that stores the necessary strings and objects to turn a plain english request into action


# quick brainstorm: 

# First the plain string comes in to the route
# then we ask the model which of the options for actions it seems like we would most likely satisfy the command
# then we ask the model to fill out the schema for the command
# then we run the verification script to make sure the command is valid
# if not, we ask it to correct it once
# then we run the command
import json
from typing import Dict, List
import ollama
from pydantic import BaseModel, create_model

from src.dispatcher.client import get_client
from src.logging import get_logger
from src.models import Device, LedStrip, Color


logger = get_logger(__name__)


class ProcessedVoiceCommand(BaseModel):
    device_commands: Dict[str, LedStrip]
    voice_command: str


class CommandContents(BaseModel):
    on_or_off: bool
    brightness: bool
    color: bool


class ThoughtProcess:
    def __init__(self, command: str, devices: List[Device]):
        self.command = command
        self.device_list = devices
        self.command_contents: CommandContents | None = None
        self.device_dict: Dict[str, Device] = {device.name: device for device in devices if device.name and device.led_strip}
        self.context_object: Dict[str, dict] | None = None
        self.relevant_devices: List[str] | None = None
        self.client = get_client()

    def think(self):
        logger.info(f'processing command "{self.command}"', {"context": [device.model_dump() for device in self.device_list]})
        self.command_contents = self.get_command_contents()
        self.context_object = self.get_context_object()
        self.relevant_devices = self.get_relevant_devices()
        for device in self.relevant_devices:
            self.get_device_commands(device)
        logger.info(f'commands processed and states set', {"recommendations": {device_name: device_state.model_dump() for device_name, device_state in self.device_dict.items()}})
    
    # this function takes in a command and decides what it is doing to the lights, 
    # whether it is turning them on or off, changing the brightness, or changing the color
    def get_command_contents(self) -> CommandContents: 
        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"""the user will give you a command to process. your job is to determine which features of the command are present. the features are: on/off, brightness, and color. you will need to determine which of these features are present in the command.
                    desired output:
    {CommandContents.model_json_schema()}
                    """

                },
                {
                    "role": "user",
                    "content": f"command: {self.command}"
                }
            ],
            model='grok-2-latest',
            response_format={"type": "json_object"}
        )
        assessment = response.choices[0].message.content
        assessment = json.loads(assessment or "{}")
        command_contents = CommandContents(**assessment)
        logger.debug('command contents assessed', command_contents.model_dump())
        return command_contents

    # this function gets the lights and shows the relevant values for the lights,
    # based on the assessment of the passed CommandContents object
    def get_context_object(self) -> Dict[str, dict]:
        if self.command_contents is None:
            raise ValueError('assessment must be set before calling get_relevant_lights')
        if self.device_dict is None:
            raise ValueError('devices must be set before calling get_relevant_lights')
        # construct an object like 
        # [
        #     {
        #         "<device name>": {
        #             "id": <device id>,
        #             "room": <room name>,
        #             "on": <on value>, -- if relevant
        #             "brightness": <brightness value>, -- if relevant
        #             "color": <color value> -- if relevant
        #         }
        #     }
        # ]
        context_struct = {}
        for device_name, device in self.device_dict.items():
            if device.led_strip is None: continue
            temp_dict = {
                "id": device.id,
                "room": device.room.name,
            }
            if self.command_contents.on_or_off:
                temp_dict['on'] = device.led_strip.on
            if self.command_contents.brightness:
                temp_dict['brightness'] = device.led_strip.brightness
            if self.command_contents.color:
                temp_dict['color'] = device.led_strip.color.model_dump()
            context_struct[device_name] = temp_dict
        logger.debug('context object', context_struct)
        return context_struct


    def get_relevant_devices(self) -> List[str]:
        if self.context_object is None:
            raise ValueError('context_object must be set before calling get_relevant_devices')
        if self.device_dict is None:
            raise ValueError('devices must be set before calling get_relevant_devices')
        class DevicesRelevance(BaseModel):
            pass
        # loop through the devices to add to the devicesRelevance class,
        # which will be used to force the output from the model
        fields = { name: (bool, ...) for name in self.device_dict.keys() }
        DevicesRelevance = create_model('DevicesRelevance', **fields)
        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"""the user will give you a command to process. your job is to determine which devices are relevant to the command. you will respond by marking the irrelevant devices as false and the relevant devices as true. bias toward marking devices not relevant unless they seem to be called out directly.
                    desired output:
    {DevicesRelevance.model_json_schema()}
                    """
                },
                {
                    "role": "user",
                    "content": f"command: {self.command}"
                }
            ],
            model='grok-2-latest',
            response_format={"type": "json_object"}
        )
        relevancy = response.choices[0].message.content
        relevancy = json.loads(relevancy or "{}")
        relevant_devices = []
        for device in self.device_dict.keys():
            if relevancy.get(device):
                relevant_devices.append(device)
        logger.debug('relevant devices', relevant_devices)
        return relevant_devices

    def get_device_commands(self, device_name: str):
        if self.context_object is None:
            raise ValueError('context_object must be set before calling get_commands')
        if self.relevant_devices is None:
            raise ValueError('relevant_devices must be set before calling get_commands')
        if self.device_dict is None:
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
        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": f"""the user will give you a command to process. your job is to tweak the settings of the device to match the user's command. this is the current state of the device: 
                    {device_for_context}

                    your job is to give the new state of the device based on the command.
                    desired output: 
    {DeviceCommands.model_json_schema()}
                    """
                },
                {
                    "role": "user",
                    "content": f"command: {self.command}"
                }
            ],
            model='grok-2-latest',
            response_format={"type": "json_object"}
        )
        commands = response.choices[0].message.content
        logger.debug('raw commands', commands)
        commands = json.loads(commands or "{}")
        # update the device state and return it
        if commands.get('on'):
            self.device_dict[device_name].led_strip.on = commands.get('on')
        if commands.get('brightness'):
            self.device_dict[device_name].led_strip.brightness = commands.get('on')
        if commands.get('color'):
            color = commands.get('color')
            self.device_dict[device_name].led_strip.red = color.get('red')
            self.device_dict[device_name].led_strip.green = color.get('green')
            self.device_dict[device_name].led_strip.blue = color.get('blue')


