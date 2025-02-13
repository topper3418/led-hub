from typing import Optional

from sqlite3 import Cursor

from src.models import (
    Device,
)


def init_devices(cursor: Cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS `devices` (
            `id` INT NOT NULL AUTO_INCREMENT,
            `mac` VARCHAR(17) NOT NULL,
            `name` VARCHAR(45) NULL,
            `ip` VARCHAR(15) NULL,
            `port` VARCHAR(6) NULL,
            `room_id` INT NULL,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`room_id`)
            UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
            UNIQUE INDEX `mac_UNIQUE` (`mac` ASC) VISIBLE,
            UNIQUE INDEX `ip_UNIQUE` (`ip` ASC) VISIBLE),
            CONSTRAINT `devices_room_id` 
            FOREIGN KEY (`room_id`) 
            REFERENCES `room` (`id`) 
            ON DELETE SET NULL 
            ON UPDATE CASCADE
        );
        """
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


def find_by_name(cursor: Cursor, name: str) -> Device | None:
    cursor.execute(
        """
        SELECT * FROM devices WHERE name = ?
        """,
        (name,),
    )
    device = cursor.fetchone()
    if device:
        return Device(**device)
    return None


def list_devices(cursor: Cursor, room: Optional[int] = None, connected: Optional[bool] = None):
    query = "SELECT * FROM devices"
    where_clauses = []
    args = []
    if room is not None:
        where_clauses.append("room_id = ?")
        args.append(room)
    if connected is not None:
        where_clauses.append("connected = ?")
        args.append(connected)
    if where_clauses:
        query = query + " Where " + ", ".join(where_clauses)
    cursor.execute(query, args)
    devices = cursor.fetchall()
    if devices:
        return [Device(**device) for device in devices]

