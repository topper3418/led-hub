import sqlite3
import src.config as config

def flush_lights():
    connection = sqlite3.connect(config.DATABASE_PATH)
    cursor = connection.cursor()
    cursor.execute("""
    UPDATE led_strips
    SET
        brightness = 255,
        red = 255,
        green = 255,
        blue = 255,
        [on] = 0;
    """)
    connection.commit()
    cursor.close()
    connection.close()
    return True

if __name__ == '__main__':
    flush_lights()
