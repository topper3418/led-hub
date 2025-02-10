from sqlite3 import Connection, Cursor

from src.models import (
    Device as DeviceModel,
    Room as RoomModel,
    LedStrip as LedStripModel,
)
import src.config as config

from .connection import get_connection
from .devices import create_device, update_device, delete_device, find_device_by_id, list_devices
from .rooms import create_room, update_room, delete_room, find_room_by_id, list_rooms
from .led_strips import create_led_strip, update_led_strip, delete_led_strip, find_led_strip_by_id, find_led_strip_by_device_id, list_led_strips



class DatabaseDevicesInterface:

    def __init__(self, cursor: Cursor | None):
        self.cursor: Cursor | None = cursor

    def create(self, device: DeviceModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return create_device(self.cursor, device)

    def update(self, device: DeviceModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return update_device(self.cursor, device)

    def delete(self, device_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return delete_device(self.cursor, device_id)

    def find_by_id(self, device_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_device_by_id(self.cursor, device_id)

    def find_many(self, room: int | None = None):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return list_devices(self.cursor, room)


class DatabaseRoomsInterface:

    def __init__(self, cursor: Cursor | None):
        self.cursor: Cursor | None = cursor

    def create(self, room: RoomModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return create_room(self.cursor, room)

    def update(self, room: RoomModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return update_room(self.cursor, room)

    def delete(self, room_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return delete_room(self.cursor, room_id)

    def find_by_id(self, room_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_room_by_id(self.cursor, room_id)

    def find_many(self):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return list_rooms(self.cursor)


class DatabaseLedStripsInterface:

    def __init__(self, cursor: Cursor | None):
        self.cursor: Cursor | None = cursor

    def create(self, led_strip: LedStripModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return create_led_strip(self.cursor, led_strip)

    def update(self, led_strip: LedStripModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return update_led_strip(self.cursor, led_strip)

    def delete(self, led_strip_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return delete_led_strip(self.cursor, led_strip_id)

    def find_by_id(self, led_strip_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_led_strip_by_id(self.cursor, led_strip_id)

    def find_by_device_id(self, device_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_led_strip_by_device_id(self.cursor, device_id)

    def find_many(self, room_id: int | None = None):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return list_led_strips(self.cursor, room_id)


class Database:
    
    def __init__(self, connection_path: str = config.DATABASE_PATH):
        self.connection_path = connection_path
        self.connection: Connection | None = None
        self.cursor: Cursor | None = None
        self.devices = DatabaseDevicesInterface(self.cursor)
        self.rooms = DatabaseRoomsInterface(self.cursor)
        self.led_strips = DatabaseLedStripsInterface(self.cursor)

    def __enter__(self):
        self.connection = get_connection(self.connection_path)
        self.cursor = self.connection.cursor()
        self.devices.cursor = self.cursor
        self.rooms.cursor = self.cursor
        self.led_strips.cursor = self.cursor
        return self

    def __exit__(self, _):
        if self.connection:
            self.connection.commit()
        if self.cursor:
            self.cursor.close()



