import sqlite3
import src.config as config


def get_connection(connection_path: str = config.DB_PATH):
    connection = sqlite3.connect(connection_path)
    connection.row_factory = sqlite3.Row
    return connection
