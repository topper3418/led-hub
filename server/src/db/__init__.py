from sqlite3 import Connection, Cursor

from src.models import (
    Device as DeviceModel,
    Room as RoomModel,
    LedStrip as LedStripModel,
)
import src.config as config

from .connection import get_connection
from .devices import create_device, record_ping, update_device, delete_device, find_device_by_id, find_by_mac, list_devices, init_devices
from .rooms import create_room, update_room, delete_room, find_room_by_id, list_rooms, init_rooms
from .led_strips import create_led_strip, list_led_strip_devices, update_led_strip, delete_led_strip, find_led_strip_by_id, find_led_strip_by_device_id, list_led_strips, init_led_strips



class DatabaseDevicesInterface:

    def __init__(self, cursor: Cursor | None):
        self.cursor: Cursor | None = cursor

    def create(self, device: DeviceModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        create_device(self.cursor, device)

    def update(self, device: DeviceModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        update_device(self.cursor, device)

    def ping(self, device_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        record_ping(self.cursor, device_id)

    def delete(self, device_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        delete_device(self.cursor, device_id)

    def find_by_id(self, device_id: int) -> DeviceModel | None:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_device_by_id(self.cursor, device_id)

    def find_by_mac(self, mac: str) -> DeviceModel | None:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_by_mac(self.cursor, mac)

    def find_by_name(self, name: str) -> DeviceModel | None:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_by_mac(self.cursor, name)

    def find_many(self, room: int | None = None, connected: bool | None = None) -> list[DeviceModel] | None:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return list_devices(self.cursor, room, connected)


class DatabaseRoomsInterface:

    def __init__(self, cursor: Cursor | None):
        self.cursor: Cursor | None = cursor

    def create(self, room: RoomModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        create_room(self.cursor, room)

    def update(self, room: RoomModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        update_room(self.cursor, room)

    def delete(self, room_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        delete_room(self.cursor, room_id)

    def find_by_id(self, room_id: int) -> RoomModel | None:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_room_by_id(self.cursor, room_id)

    def find_many(self) -> list[RoomModel]:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return list_rooms(self.cursor)


class DatabaseLedStripsInterface:

    def __init__(self, cursor: Cursor | None):
        self.cursor: Cursor | None = cursor

    def create(self, led_strip: LedStripModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        create_led_strip(self.cursor, led_strip)

    def update(self, led_strip: LedStripModel):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        update_led_strip(self.cursor, led_strip)

    def delete(self, led_strip_id: int):
        if not self.cursor:
            raise ValueError("Cursor is not set")
        delete_led_strip(self.cursor, led_strip_id)

    def find_by_id(self, led_strip_id: int) -> LedStripModel | None:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_led_strip_by_id(self.cursor, led_strip_id)

    def find_by_device_id(self, device_id: int) -> LedStripModel | None:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return find_led_strip_by_device_id(self.cursor, device_id)

    def find_many(self, room_id: int | None = None) -> list[LedStripModel]:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return list_led_strips(self.cursor, room_id)

    def find_many_devices(self, room_id: int | None = None) -> list[DeviceModel]:
        if not self.cursor:
            raise ValueError("Cursor is not set")
        return list_led_strip_devices(self.cursor, room_id)


class Database:
    
    def __init__(self, connection_path: str = config.DATABASE_PATH):
        self.connection_path = connection_path
        self.connection: Connection | None = None
        self.cursor: Cursor | None = None
        self.devices = DatabaseDevicesInterface(self.cursor)
        self.rooms = DatabaseRoomsInterface(self.cursor)
        self.led_strips = DatabaseLedStripsInterface(self.cursor)

    def init_db(self):
        if not self.connection or not self.cursor:
            raise ValueError('must have valid connection to init db')
        init_rooms(self.cursor)
        init_devices(self.cursor)
        init_led_strips(self.cursor)

    def __enter__(self):
        self.connection = get_connection(self.connection_path)
        self.cursor = self.connection.cursor()
        self.devices.cursor = self.cursor
        self.rooms.cursor = self.cursor
        self.led_strips.cursor = self.cursor
        return self

    def __exit__(self, *_):
        if self.connection:
            self.connection.commit()
        if self.cursor:
            self.cursor.close()

    def open_connection(self):
        if self.connection is None:
            self.connection = get_connection(self.connection_path)
            self.cursor = self.connection.cursor()
            self.devices.cursor = self.cursor
            self.rooms.cursor = self.cursor
            self.led_strips.cursor = self.cursor
        else:
            raise RuntimeError("Connection is already open")

    def close_connection(self):
        if self.connection:
            self.commit()
            self.cursor.close() if self.cursor else None
            self.connection.close()
            self.connection = None
            self.cursor = None
            self.devices.cursor = None
            self.rooms.cursor = None
            self.led_strips.cursor = None
        else:
            raise RuntimeError("Connection is not open")

    def commit(self):
        if self.connection:
            print('committing changes')
            self.connection.commit()
        else:
            raise RuntimeError("Connection is not open")



