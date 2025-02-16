import sqlite3

from src.config import DATABASE_PATH
from src.logging import get_logger



logger = get_logger(__name__)


def get_connection(connection_path: str = DATABASE_PATH):
    logger.debug("Connecting to database", {"connection_path": connection_path})
    connection = sqlite3.connect(connection_path)
    connection.row_factory = sqlite3.Row
    return connection
