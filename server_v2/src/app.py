from flask import Flask, jsonify, request
from pydantic import ValidationError
import asyncio

from src.db import Database
from src.dispatcher import ThoughtProcess
from src.models import Device
from src.clients import LedStripClient


app = Flask(__name__)

db = Database()


@app.route('/', methods=['GET'])
def get_devices():
    room_id = request.args.get('room_id')
    devices = db.devices.find_many(None if not room_id else int(room_id))
    return jsonify(devices)


@app.route('/', methods=['POST'])
def handshake():
    body = request.json
    if not body:
        return jsonify({"error": "No data provided"}), 400
    device_data = body.get('data')
    try:
        device = Device(**device_data)
    except ValidationError as e:
        error_message = "Error parsing device data"
        return jsonify({"error": error_message, "details": e.errors()}), 400
    existing_device = db.devices.find_by_mac(device.mac)
    if existing_device:
        existing_message = "Device already exists"
        return jsonify({"message": existing_message, "data": existing_device.model_dump()}), 200
    db.devices.create(device)
    success_message = "Device created"
    model_data = device.model_dump()
    return jsonify({"message": success_message, "data": model_data}), 201


@app.route('/many', methods=['POST'])
async def write_to_many():
    body = request.json
    if not body:
        return jsonify({"error": "No body provided"}), 400
    devices_data = body.get('data', {}).get('devices')
    if not devices_data:
        return jsonify({"error": "data must have a valid 'devices' array"})
    clients = []
    devices = []
    for device_data in devices_data:
        # load it into the structure
        try:
            device = Device(**device_data)
        except ValidationError as e:
            error_message = "Error parsing device data"
            return jsonify({"error": error_message, "details": e.errors()}), 400
        devices.append(device)
        # make sure they have an id and that its valid
        if not device.id:
            error_message = "Device id is required when writing many"
            return jsonify({"error": error_message}), 400
        if db.devices.find_by_id(device.id) is None:
            error_message = f"Device with id {device.id} does not exist"
            return jsonify({"error": error_message}), 404
        # make sure the device has a state
        if not device.led_strip_state:
            error_message = "Device must have a 'led_strip' state property"
            return jsonify({"error": error_message}), 400
        # load the device into a client
        client = LedStripClient(device)
        clients.append(client)
    # write the clients
    for client in clients:
        client.set_state(client.device.led_strip)
    await asyncio.gather(*(client.set_state_async(client.device.led_strip) for client in clients))
    # devices should have been updated with each client-set state operation
    # so update the database
    for device in devices: 
        db.devices.update(device)
    return jsonify({"data": {"devices": [device.model_dump() for device in devices]}})


@app.route('/<int:device_id>', methods=['GET'])
def read_device(device_id):
    # load the device and state
    device = db.devices.find_by_id(device_id)
    if device is None:
        error_message = f"No device found with id {device_id}"
        return jsonify({"error": error_message})
    device.led_strip_state = db.led_strips.find_by_device_id(device_id)
    # return the data
    return jsonify({"data": {"device": device}})


@app.route('/<int:device_id>', methods=['POST'])
def write_to_one(device_id):
    # load the device
    device = db.devices.find_by_id(device_id)
    if device is None:
        error_message = f"No device found with id {device_id}"
        return jsonify({"error": error_message})
    # parse the data
    body = request.json
    if not body:
        return jsonify({"error": "No data provided"}), 400
    led_strip = body.get('data', {}).get('led_strip')
    # get the client
    client = LedStripClient(device)
    # write the data
    client.set_state(led_strip)
    # update in the db
    db.devices.update(device)
    # return the data
    return jsonify({"data": {"device": device}})
    

@app.route('/<int:device_id>', methods=['PUT'])
def update_device(device_id):
    # load the device
    device = db.devices.find_by_id(device_id)
    if device is None:
        error_message = f"No device found with id {device_id}"
        return jsonify({"error": error_message})
    # parse the data
    body = request.json or {}
    data = body.get('data')
    if not data: 
        return jsonify({"error": "No data provided"}), 400
    # update the name if given
    name = data.get('name')
    if name:
        device.name = name
    # update the room if given
    room_id = data.get('room_id')
    if room_id:
        room = db.rooms.find_by_id(room_id)
        if room is None:
            error_message = f"No room found with id {room_id}"
            return jsonify({"error": error_message }), 404
        device.room_id = room_id
    # update the database
    db.devices.update(device)
    # return the data
    return jsonify({"data": {"device": device}})


@app.route('/command')
async def process_voice_command():
    # parse the data
    body = request.json or {}
    data = body.get('data')
    if not data: 
        return jsonify({"error": "No data provided"}), 400
    # get the command
    command = data.get('command')
    if not command:
        return jsonify({"error": "No command provided"}), 400
    # get the devices and their current state
    devices = db.devices.find_many(connected=True)
    thought_process = ThoughtProcess(command, devices)
    thought_process.think
    # work through the device states and push
    update_promises = []
    devices = []
    for device_name, state in thought_process.device_states.items():
        device = db.devices.find_by_name(device_name)
        devices.append(device)
        client = LedStripClient(device)
        updated_state = client.set_state_async(device.led_strip_state)
        update_promises.append(updated_state)
    await asyncio.gather(*update_promises)
    # update the db
    for device in devices:
        db.devices.update(device)
    return jsonify({"data": {"devices": [device.model_dump() for device in devices]}})


