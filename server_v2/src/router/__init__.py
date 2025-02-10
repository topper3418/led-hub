from flask import Flask, jsonify, request
from pydantic import ValidationError

from src.db import Database
from src.models import Device, LedStrip, Room


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

