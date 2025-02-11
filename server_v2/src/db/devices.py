from typing import Optional

from sqlite3 import Cursor

from src.models import (
    Device,
)


def create_device(cursor: Cursor, device: Device):
    cursor.execute(
        """
        INSERT INTO devices (mac, ip, name, connected, port)
        VALUES (?, ?, ?, ?, ?)
        """,
        (device.mac, device.ip, device.name, device.connected, device.port),
    )
    device.id = cursor.lastrowid


def update_device(cursor: Cursor, device: Device):
    cursor.execute(
        """
        UPDATE devices
        SET mac = ?, ip = ?, name = ?, connected = ?, port = ?
        WHERE id = ?
        """,
        (device.mac, device.ip, device.name, device.connected, device.port, device.id),
    )


def delete_device(cursor: Cursor, device_id: int):
    cursor.execute(
        """
        DELETE FROM devices WHERE id = ?
        """,
        (device_id,),
    )


def find_device_by_id(cursor: Cursor, device_id: int) -> Device | None:
    cursor.execute(
        """
        SELECT * FROM devices WHERE id = ?
        """,
        (device_id,),
    )
    device = cursor.fetchone()
    if device:
        return Device(**device)
    return None


def find_by_mac(cursor: Cursor, mac: str) -> Device | None:
    cursor.execute(
        """
        SELECT * FROM devices WHERE mac = ?
        """,
        (mac,),
    )
    device = cursor.fetchone()
    if device:
        return Device(**device)
    return None


def list_devices(cursor: Cursor, room: Optional[int] = None):
    query = "SELECT * FROM devices"
    if room:
        query += " WHERE room_id = ?"
    cursor.execute(query, (room,))
    devices = cursor.fetchall()
    if devices:
        return [Device(**device) for device in devices]

