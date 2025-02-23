from sqlite3 import Cursor

from src.db.util import read_sql_init_file
from src.models import Device, LedStrip
from src.logging import get_logger

logger = get_logger(__name__)


def init_led_strips(cursor: Cursor):
    logger.info("Initializing led_strips table")
    init_query = read_sql_init_file("led_strips")
    try:
        cursor.execute(init_query)
    except Exception as e:
        logger.error('Failed to initialize led_strips table', {'error': str(e)})
        raise e


def create_led_strip(cursor: Cursor, led_strip: LedStrip):
    logger.info('Creating led_strip', {'led_strip': led_strip.model_dump()})
    try: 
        cursor.execute(
            """
            INSERT INTO led_strips (device_id, "on", brightness, red, green, blue, num_leds)
            VALUES (?, ?, ?, ?, ?, ?, ?);
            """,
            (led_strip.device_id, led_strip.on, led_strip.brightness, led_strip.red, led_strip.green, led_strip.blue, led_strip.num_leds),
        )
    except Exception as e:
        logger.error('Failed to create led_strip', {'led_strip': led_strip, 'error': str(e)})
        raise e
    led_strip.id = cursor.lastrowid
    logger.debug('Led_strip created', {'led_strip': led_strip.model_dump()})


def update_led_strip(cursor: Cursor, led_strip: LedStrip):
    logger.info('Updating led_strip', {'led_strip': led_strip.model_dump()})
    try:
        cursor.execute(
            """
            UPDATE led_strips
            SET `on` = ?, brightness = ?, red = ?, green = ?, blue = ?, num_leds = ?
            WHERE id = ?
            """,
            (led_strip.on, led_strip.brightness, led_strip.red, led_strip.green, led_strip.blue, led_strip.id, led_strip.num_leds),
        )
    except Exception as e:
        logger.error('Failed to update led_strip', {'led_strip': led_strip.model_dump(), 'error': str(e)})
        raise e
    logger.debug('Led_strip updated', {'led_strip': led_strip.model_dump()})


def delete_led_strip(cursor: Cursor, led_strip_id: int):
    logger.info('Deleting led_strip', {'led_strip_id': led_strip_id})
    try:
        cursor.execute(
            """
            DELETE FROM led_strips WHERE id = ?
            """,
            (led_strip_id,),
        )
    except Exception as e:
        logger.error('Failed to delete led_strip', {'led_strip_id': led_strip_id, 'error': str(e)})
        raise e
    logger.debug('Led_strip deleted', {'led_strip_id': led_strip_id})


def find_led_strip_by_id(cursor: Cursor, led_strip_id: int) -> LedStrip | None:
    logger.info('Finding led_strip by id', {'led_strip_id': led_strip_id})
    try: 
        cursor.execute(
            """
            SELECT * FROM led_strips WHERE id = ?
            """,
            (led_strip_id,),
        )
        led_strip = cursor.fetchone()
    except Exception as e:
        logger.error('Failed to find led_strip by id', {'led_strip_id': led_strip_id, 'error': str(e)})
        raise e
    try: 
        if led_strip:
            return LedStrip(**led_strip)
        return None
    except Exception as e:
        logger.error('Failed to create LedStrip object', {'led_strip_data': led_strip, 'error': str(e)})
        raise e


def find_led_strip_by_device_id(cursor: Cursor, device_id: int) -> LedStrip | None:
    logger.debug('Finding led_strip by device_id', {'device_id': device_id})
    try: 
        cursor.execute(
            """
            SELECT * FROM led_strips WHERE device_id = ?
            """,
            (device_id,),
        )
        led_strip = cursor.fetchone()
    except Exception as e:
        logger.error('Failed to find led_strip by device_id', {'device_id': device_id, 'error': str(e)})
        raise e
    logger.debug('Led_strip found', {'led_strip_data': dict(led_strip)})
    try:
        if led_strip:
            return LedStrip(**led_strip)
        return None
    except Exception as e:
        logger.error('Failed to parse led_strip object', {'led_strip_data': led_strip, 'error': str(e)})
        raise e


def list_led_strips(cursor: Cursor, room_id: int | None = None) -> list[LedStrip]:
    logger.debug('listing led strips', {'room_id': room_id})
    try: 
        cursor.execute(
            """
            SELECT 
                led_strips.id, 
                led_strips.device_id, 
                led_strips.on, 
                led_strips.brightness, 
                led_strips.red, 
                led_strips.green, 
                led_strips.blue, 
                led_strips.num_leds,
                led_strips.led_pin
            FROM led_strips
            JOIN devices ON led_strips.device_id = devices.id
            WHERE devices.room_id = ?
            """,
            (room_id,),
        )
        led_strips = cursor.fetchall()
    except Exception as e:
        logger.error('Failed to list led_strips', {'error': str(e)})
        raise e
    try:
        if led_strips:
            logger.debug('found data for led strips', {"data": led_strips})
            return [LedStrip(**led_strip) for led_strip in led_strips]
        return []
    except Exception as e:
        logger.error('Failed to parse led_strip objects', {'led_strips_data': led_strips, 'error': str(e)})
        raise e


def list_led_strip_devices(cursor, room_id: int | None) -> list[Device]:
    logger.debug('Listing led_strip devices', {'room_id': room_id})
    try:
        cursor.execute(
            """
            select * from led_strips join devices on led_strips.device_id = devices.id;
            """,
        )
        data = cursor.fetchall()
    except Exception as e:
        logger.error('Failed to list led_strip devices', {'error': str(e)})
        raise e
    logger.debug('Led_strip devices found', {'led_strip_data': [dict(row) for row in data]})
    try:
        devices = []
        for row in data:
            device = Device(**row)
            device.led_strip = LedStrip(**row)
            devices.append(device)
        return devices
    except Exception as e:
        logger.error('Failed to parse led_strip device objects', {'led_strip_data': data, 'error': str(e)})
        raise e
    
