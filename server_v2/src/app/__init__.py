from flask import Flask, jsonify, request
from pydantic import ValidationError
import asyncio

from src.db import Database
from src.dispatcher import ThoughtProcess
from src.models import Device
from src.clients import LedStripClient
from src.logging import get_logger


app = Flask(__name__)

logger = get_logger(__name__)



@app.route('/', methods=['GET'])
def get_devices():
    logger.info('processing request to list devices')
    room_id = request.args.get('room_id')
    with Database() as db:
        devices = db.devices.find_many(None if not room_id else int(room_id))
    device_data = [device.model_dump() for device in devices or []]
    return jsonify({"data": {"devices": device_data}})


@app.route('/', methods=['POST'])
def handshake():
    body = request.json
    if not body:
        return jsonify({"error": "No data provided"}), 400
    device_data = body.get('data')
    logger.info('processing handshake request', {'device_data': device_data})
    try:
        device = Device(**device_data)
    except ValidationError as e:
        error_message = "Error parsing device data"
        logger.error(error_message, {"error": e.errors()})
        return jsonify({"error": error_message, "details": e.errors()}), 400
    with Database() as db:
        existing_device = db.devices.find_by_mac(device.mac)
    if existing_device:
        existing_message = "Device already exists"
        logger.debug(existing_message)
        return jsonify({"message": existing_message, "data": existing_device.model_dump()}), 200
    with Database() as db:
        db.devices.create(device)
    success_message = "Device created"
    model_data = device.model_dump()
    logger.info(success_message, {"data": model_data})
    return jsonify({"message": success_message, "data": model_data}), 201


@app.route('/many', methods=['POST'])
async def write_to_many():
    body = request.json
    if not body:
        return jsonify({"error": "No body provided"}), 400
    devices_data = body.get('data', {}).get('devices')
    if not devices_data:
        return jsonify({"error": "data must have a valid 'devices' array"})
    logger.info('received request to write to many')
    clients = []
    devices = []
    for device_data in devices_data:
        # load it into the structure
        try:
            device = Device(**device_data)
        except ValidationError as e:
            error_message = "Error parsing device data"
            logger.error(error_message, {"error": e.errors()})
            return jsonify({"error": error_message, "details": e.errors()}), 400
        devices.append(device)
        # make sure they have an id and that its valid
        if not device.id:
            error_message = "Device id is required when writing many"
            logger.error(error_message)
            return jsonify({"error": error_message}), 400
        # look in the db, but don't save it to avoid confusion
        with Database() as db:
            if db.devices.find_by_id(device.id) is None:
                error_message = f"Device with id {device.id} does not exist"
                logger.error(error_message)
                return jsonify({"error": error_message}), 404
        # make sure the device has a state
        if not device.led_strip_state:
            error_message = "Device must have a 'led_strip' state property"
            logger.error(error_message)
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
    with Database() as db:
        for device in devices: 
            db.devices.update(device)
    succes_msg = 'successfully wrote to devices'
    device_data = {"devices": [device.model_dump() for device in devices]}
    logger.info(succes_msg, device_data)
    return jsonify({"data": device_data, "message": succes_msg})


@app.route('/<int:device_id>', methods=['GET'])
def read_device(device_id):
    logger.info(f'processing request for data on device id {device_id}')
    # load the device and state
    with Database() as db:
        device = db.devices.find_by_id(device_id)
    if device is None:
        error_message = f"No device found with id {device_id}"
        logger.error(error_message)
        return jsonify({"error": error_message})
    with Database() as db:
        device.led_strip_state = db.led_strips.find_by_device_id(device_id)
    # return the data
    device_data = device.model_dump()
    return jsonify({"data": {"device": device_data}})


@app.route('/<int:device_id>', methods=['POST'])
def write_to_one(device_id):
    logger.debug(f'received request to write to device id {device_id}')
    # load the device
    with Database() as db:
        device = db.devices.find_by_id(device_id)
    if device is None:
        error_message = f"No device found with id {device_id}"
        logger.error(error_message)
        return jsonify({"error": error_message})
    # parse the data
    body = request.json
    if not body:
        error_message = "No data provided"
        logger.error(error_message)
        return jsonify({"error": error_message}), 400
    logger.info(f'processing request to write to device {device.name}', {"device": device.model_dump(), "body": body})
    led_strip = body.get('data', {}).get('led_strip')
    # get the client
    client = LedStripClient(device)
    # write the data
    client.set_state(led_strip)
    # update in the db
    with Database() as db:
        db.devices.update(device)
    # return the data
    device_data = device.model_dump()
    success_msg = "successfully wrote to device"
    logger.error(success_msg, {"device": device_data})
    return jsonify({"data": {"device": device_data}})
    

@app.route('/<int:device_id>', methods=['PUT'])
def update_device(device_id):
    logger.debug(f'received request to modify device data for device id {device_id}')
    # load the device
    with Database() as db:
        device = db.devices.find_by_id(device_id)
    if device is None:
        error_message = f"No device found with id {device_id}"
        return jsonify({"error": error_message})
    # parse the data
    body = request.json or {}
    data = body.get('data')
    if not data: 
        error_message = "No data provided"
        logger.error(error_message)
        return jsonify({"error": error_message}), 400
    logger.info(f'processing request to update device with mac {device.mac}', {"device": device.model_dump(), "body": body})
    # update the name if given
    name = data.get('name')
    if name:
        device.name = name
    # update the room if given
    room_id = data.get('room_id')
    if room_id:
        with Database() as db:
            room = db.rooms.find_by_id(room_id)
        if room is None:
            error_message = f"No room found with id {room_id}"
            logger.error(error_message)
            return jsonify({"error": error_message }), 404
        device.room_id = room_id
    # update the database
    with Database() as db:
        db.devices.update(device)
    # return the data
    device_data = device.model_dump()
    success_message = "successfully updated device"
    logger.info(success_message, {"device": device_data})
    return jsonify({"data": {"device": device_data, "message": success_message}})


@app.route('/command')
async def process_voice_command():
    logger.debug('received command to process')
    # parse the data
    body = request.json or {}
    data = body.get('data')
    if not data: 
        error_message = "No data provided"
        logger.error(error_message)
        return jsonify({"error": error_message}), 400
    # get the command
    command = data.get('command')
    if not command:
        error_message = "No command provided"
        logger.error(error_message)
        return jsonify({"error": error_message}), 400
    # get the devices and their current state
    with Database() as db:
        devices = db.devices.find_many(connected=True)
    if not devices:
        error_message = "devices must be retrievable and connected for the voice command to work"
        logger.error(error_message)
        return jsonify({"error": error_message}), 500
    thought_process = ThoughtProcess(command, devices)
    thought_process.think()
    # work through the device states and push
    update_promises = []
    devices = []
    for device_name, state in thought_process.device_states.items():
        logger.debug(f'attempting to update device {device_name}', {"state": state.model_dump()})
        with Database() as db:
            device = db.devices.find_by_name(device_name)
        devices.append(device)
        client = LedStripClient(device)
        updated_state = client.set_state_async(device.led_strip_state)
        update_promises.append(updated_state)
    await asyncio.gather(*update_promises)
    # update the db
    with Database() as db:
        for device in devices:
            db.devices.update(device)
    success_message = "Successfully processed command and wrote to devices"
    device_data = [device.model_dump() for device in devices]
    logger.info(success_message, {"devices": device_data, "command": command})
    return jsonify({"data": {"devices": device_data, "message": success_message}})


