from sqlite3 import Cursor

from src.models import Room


def create_room(cursor: Cursor, room: Room):
    cursor.execute(
        """
        INSERT INTO rooms (name)
        VALUES (?)
        """,
        (room.name,),
    )
    room.id = cursor.lastrowid


def update_room(cursor: Cursor, room: Room):
    cursor.execute(
        """
        UPDATE rooms
        SET name = ?
        WHERE id = ?
        """,
        (room.name, room.id),
    )


def delete_room(cursor: Cursor, room_id: int):
    cursor.execute(
        """
        DELETE FROM rooms WHERE id = ?
        """,
        (room_id,),
    )


def find_room_by_id(cursor: Cursor, room_id: int) -> Room | None:
    cursor.execute(
        """
        SELECT * FROM rooms WHERE id = ?
        """,
        (room_id,),
    )
    room = cursor.fetchone()
    if room:
        return Room(**room)
    return None


def list_rooms(cursor: Cursor):
    cursor.execute(
        """
        SELECT * FROM rooms
        """
    )
    rooms = cursor.fetchall()
    if rooms:
        return [Room(**room) for room in rooms]
    return []
