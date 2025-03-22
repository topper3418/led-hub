from sqlite3 import Cursor

from src.db.util import read_sql_init_file
from src.models import Room
from src.logging import get_logger

logger = get_logger(__name__)


def init_rooms(cursor: Cursor):
    logger.info("Initializing rooms table")
    init_query = read_sql_init_file("rooms")
    try:
        cursor.execute(init_query)
    except Exception as e:
        logger.error('Failed to initialize rooms table', {'error': str(e)})
        raise e


def create_room(cursor: Cursor, room: Room):
    logger.info('Creating room', {'room': room})
    try:
        cursor.execute(
            """
            INSERT INTO rooms (name)
            VALUES (?)
            """,
            (room.name,),
        )
    except Exception as e:
        logger.error('Failed to create room', {'room': room, 'error': str(e)})
        raise e
    room.id = cursor.lastrowid
    logger.debug('Room created', {'room': room})


def update_room(cursor: Cursor, room: Room):
    logger.info('Updating room', {'room': room})
    try:
        cursor.execute(
            """
            UPDATE rooms
            SET name = ?
            WHERE id = ?
            """,
            (room.name, room.id),
        )
    except Exception as e:
        logger.error('Failed to update room', {'room': room, 'error': str(e)})
        raise e
    logger.debug('Room updated', {'room': room})


def delete_room(cursor: Cursor, room_id: int):
    logger.info('Deleting room', {'room_id': room_id})
    try:
        cursor.execute(
            """
            DELETE FROM rooms WHERE id = ?
            """,
            (room_id,),
        )
    except Exception as e:
        logger.error('Failed to delete room', {'room_id': room_id, 'error': str(e)})
        raise e
    logger.debug('Room deleted', {'room_id': room_id})


def find_room_by_id(cursor: Cursor, room_id: int) -> Room | None:
    logger.debug('Finding room by id', {'room_id': room_id})
    try:
        cursor.execute(
            """
            SELECT * FROM rooms WHERE id = ?
            """,
            (room_id,),
        )
        room = cursor.fetchone()
    except Exception as e:
        logger.error('Failed to find room by id', {'room_id': room_id, 'error': str(e)})
        raise e
    logger.debug('Room found', {'room': room})
    try:
        if room:
            return Room(**room)
        return None
    except Exception as e:
        logger.error('Failed to create room object', {'room': room, 'error': str(e)})
        raise e


def list_rooms(cursor: Cursor):
    logger.debug('Listing rooms')
    try:
        cursor.execute(
            """
            SELECT * FROM rooms
            """
        )
        rooms = cursor.fetchall()
    except Exception as e:
        logger.error('Failed to list rooms', {'error': str(e)})
        raise e
    logger.debug('Rooms listed', {'rooms': rooms})
    try:
        if rooms:
            return [Room(**room) for room in rooms]
        return []
    except Exception as e:
        logger.error('Failed to create room objects', {'rooms': rooms, 'error': str(e)})
        raise e


