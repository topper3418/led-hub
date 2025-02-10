
from sqlite3 import Cursor

from src.models import LedStrip


def create_led_strip(cursor: Cursor, led_strip: LedStrip) -> LedStrip:
    cursor.execute(
        """
        INSERT INTO led_strips (device_id, on, brightness, red, green, blue)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (led_strip.device_id, led_strip.on, led_strip.brightness, led_strip.red, led_strip.green, led_strip.blue),
    )
    led_strip.id = cursor.lastrowid
    return led_strip


def update_led_strip(cursor: Cursor, led_strip: LedStrip):
    cursor.execute(
        """
        UPDATE led_strips
        SET on = ?, brightness = ?, red = ?, green = ?, blue = ?
        WHERE id = ?
        """,
        (led_strip.on, led_strip.brightness, led_strip.red, led_strip.green, led_strip.blue, led_strip.id),
    )


def delete_led_strip(cursor: Cursor, led_strip_id: int):
    cursor.execute(
        """
        DELETE FROM led_strips WHERE id = ?
        """,
        (led_strip_id,),
    )


def find_led_strip_by_id(cursor: Cursor, led_strip_id: int) -> LedStrip | None:
    cursor.execute(
        """
        SELECT * FROM led_strips WHERE id = ?
        """,
        (led_strip_id,),
    )
    led_strip = cursor.fetchone()
    if led_strip:
        return LedStrip(**led_strip)
    return None


def find_led_strip_by_device_id(cursor: Cursor, device_id: int) -> LedStrip | None:
    cursor.execute(
        """
        SELECT * FROM led_strips WHERE device_id = ?
        """,
        (device_id,),
    )
    led_strip = cursor.fetchone()
    if led_strip:
        return LedStrip(**led_strip)
    return None


def list_led_strips(cursor: Cursor, room_id: int | None = None) -> list[LedStrip]:
    cursor.execute(
        """
        SELECT led_strips.id, led_strips.device_id, led_strips.on, led_strips. brightness, led_strips.red, led_strips.green, led_strips.blue
        FROM led_strips
        JOIN devices ON led_strips.device_id = devices.id
        WHERE devices.room_id = ?
        """,
        (room_id,),
    )
    led_strips = cursor.fetchall()
    if led_strips:
        return [LedStrip(**led_strip) for led_strip in led_strips]
    return []
