from typing import Optional

from sqlite3 import Cursor

from src.db.util import read_sql_init_file
from src.models import (
    Device,
)
from src.logging import get_logger

logger = get_logger(__name__)


def init_devices(cursor: Cursor):
    logger.info("Initializing devices table")
    init_query = read_sql_init_file("devices")
    try: 
        cursor.execute(init_query)
    except Exception as e:
        logger.error('Failed to initialize devices table', {'error': str(e)})
        raise e


def create_device(cursor: Cursor, device: Device):
    logger.info('Creating device', {'device': device.model_dump()})
    try:
        cursor.execute(
            """
            INSERT INTO devices (mac, ip, name)
            VALUES (?, ?, ?)
            """,
            (device.mac, device.ip, device.name),
        )
    except Exception as e:
        logger.error('Failed to create device', {'device': device.model_dump(), 'error': str(e)})
        raise e
    device.id = cursor.lastrowid
    logger.debug('Device created', {'device': device.model_dump()})


def update_device(cursor: Cursor, device: Device):
    logger.info('Updating device', {'device': device.model_dump()})
    try:
        cursor.execute(
            """
            UPDATE devices
            SET mac = ?, ip = ?, name = ?
            WHERE id = ?
            """,
            (device.mac, device.ip, device.name, device.id),
        )
    except Exception as e:
        logger.error('Failed to update device', {'device': device.model_dump(), 'error': str(e)})
        raise e
    logger.debug('Device updated', {'device': device.model_dump()})


def record_ping(cursor: Cursor, device_id: int):
    logger.debug('Recording ping', {'device_id': device_id})
    try:
        cursor.execute(
            """
            UPDATE devices
            SET last_ping = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (device_id,),
        )
    except Exception as e:
        logger.error('Failed to record ping', {'device_id': device_id, 'error': str(e)})
        raise e
    logger.debug('Ping recorded', {'device_id': device_id})


def delete_device(cursor: Cursor, device_id: int):
    logger.info('Deleting device', {'device_id': device_id})
    try: 
        cursor.execute(
            """
            DELETE FROM devices WHERE id = ?
            """,
            (device_id,),
        )
    except Exception as e:
        logger.error('Failed to delete device', {'device_id': device_id, 'error': str(e)})
        raise e
    logger.debug('Device deleted', {'device_id': device_id})


def find_device_by_id(cursor: Cursor, device_id: int) -> Device | None:
    logger.debug('Finding device by id', {'device_id': device_id})
    try:
        cursor.execute(
            """
            SELECT * FROM devices WHERE id = ?
            """,
            (device_id,),
        )
        device = cursor.fetchone()
    except Exception as e:
        logger.error('Failed to find device by id', {'device_id': device_id, 'error': str(e)})
        raise e
    logger.debug('Device found', {'device_data': device})
    try:
        if device:
            return Device(**device)
        return None
    except Exception as e:
        logger.error('Failed to parse device object', {'device_data': device, 'error': str(e)})
        raise e


def find_by_mac(cursor: Cursor, mac: str) -> Device | None:
    logger.debug('Finding device by mac', {'mac': mac})
    try:
        cursor.execute(
            """
            SELECT * FROM devices WHERE mac = ?
            """,
            (mac,),
        )
        device = cursor.fetchone()
    except Exception as e:
        logger.error('Failed to find device by mac', {'mac': mac, 'error': str(e)})
        raise e
    logger.debug('Device found', {'device_data': device})
    try:
        if device:
            return Device(**device)
        return None
    except Exception as e:
        logger.error('Failed to parse device object', {'device_data': device, 'error': str(e)})
        raise e


def find_by_name(cursor: Cursor, name: str) -> Device | None:
    logger.debug('Finding device by name', {'name': name})
    try:
        cursor.execute(
            """
            SELECT * FROM devices WHERE name = ?
            """,
            (name,),
        )
        device = cursor.fetchone()
    except Exception as e:
        logger.error('Failed to find device by name', {'name': name, 'error': str(e)})
        raise e
    logger.debug('Device found', {'device_data': device})
    try:
        if device:
            return Device(**device)
        return None
    except Exception as e:
        logger.error('Failed to parse device object', {'device_data': device, 'error': str(e)})


def list_devices(cursor: Cursor, room: Optional[int] = None, connected: Optional[bool] = None):
    logger.debug('Listing devices', {'room': room, 'connected': connected})
    query = "SELECT * FROM devices"
    where_clauses = []
    args = []
    if room == 0: # room_id=0 means no room
        where_clauses.append("room_id IS NULL")
    elif room is not None:
        where_clauses.append("room_id = ?")
        args.append(room)
    if connected is not None:
        where_clauses.append("connected = ?")
        args.append(connected)
    if where_clauses:
        query = query + " Where " + ", ".join(where_clauses)
    try: 
        cursor.execute(query, args)
        devices = cursor.fetchall()
    except Exception as e:
        logger.error('Failed to list devices', {'room': room, 'connected': connected, 'query': query, 'error': str(e)})
        raise e
    logger.debug('Devices listed', {'devices': devices})
    try: 
        if devices:
            return [Device(**device) for device in devices]
    except Exception as e:
        logger.error('Failed to parse devices', {'devices_data': devices, 'error': str(e)})
        raise e

