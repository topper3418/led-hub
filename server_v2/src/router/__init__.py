from flask import Flask, jsonify, request
from pydantic import ValidationError

from src.db import Database
from src.models import Device, LedStrip, Room
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
def write_many():
    body = request.json
    if not body:
        return jsonify({"error": "No data provided"}), 400
    devices_data = body.get('data')
    clients = []
    for device_data in devices_data:
        # load it into the structure
        try:
            device = Device(**device_data)
        except ValidationError as e:
            error_message = "Error parsing device data"
            return jsonify({"error": error_message, "details": e.errors()}), 400
        # make sure they have an id and that its valid
        if not device.id:
            error_message = "Device id is required when writing many"
            return jsonify({"error": error_message}), 400
        if db.devices.find_by_id(device.id) is None:
            error_message = f"Device with id {device.id} does not exist"
            return jsonify({"error": error_message}), 404
        # make sure the device has a state
        if not device.led_strip:
            error_message = "Device must have a state"
            return jsonify({"error": error_message}), 400
        # load the device into a client
        client = LedStripClient(device)
        # save the client 
        clients.append(client)
    # write the clients
    for client in clients:
        client.set_state(client.device.led_strip)
        

