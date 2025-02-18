import os
import sqlite3

from src.config import DATABASE_PATH
from src.logging import get_logger

logger = get_logger(__name__)


def get_connection(connection_path: str = DATABASE_PATH):
    logger.debug("Connecting to database", {"connection_path": connection_path})
    folder_name = os.path.dirname(connection_path)
    if not os.path.exists(folder_name):
        error = f"No folder found matching {folder_name}"
        logger.error(error)
        raise ValueError(error)
    connection = sqlite3.connect(connection_path)
    def dict_factory(cursor, row):
        return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}
    connection.row_factory = dict_factory
    return connection
